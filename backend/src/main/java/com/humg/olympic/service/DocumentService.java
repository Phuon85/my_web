package com.humg.olympic.service;

import com.humg.olympic.dto.DocumentResponse;
import com.humg.olympic.entity.Document;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.DocumentRepository;
import com.humg.olympic.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository     userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // ── Lấy danh sách ──────────────────────────────────────────────────────────
    public List<DocumentResponse> getAll(String subject, String search) {
        List<Document> docs;
        if (search != null && !search.isBlank()) {
            docs = documentRepository.search(search.trim());
        } else {
            docs = documentRepository.findFiltered(
                (subject != null && !subject.isBlank()) ? subject : null,
                null
            );
        }
        return docs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Lấy chi tiết 1 tài liệu ────────────────────────────────────────────────
    public DocumentResponse getById(Long id) {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài liệu"));
        documentRepository.incrementView(id);   // tăng lượt xem
        return toResponse(doc);
    }

    // ── Upload file ─────────────────────────────────────────────────────────────
    @Transactional
    public DocumentResponse upload(String title, String subject,
                                   String description, boolean isPublic,
                                   MultipartFile file) throws IOException {
        // 1. Lấy user hiện tại
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg uploader = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 2. Kiểm tra file hợp lệ
        validateFile(file);

        // 3. Tạo thư mục nếu chưa có
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // 4. Tạo tên file duy nhất bằng UUID
        String originalName = Objects.requireNonNull(file.getOriginalFilename());
        String ext    = getExtension(originalName);
        String stored = UUID.randomUUID() + "." + ext;
        Path   target = uploadPath.resolve(stored);

        // 5. Lưu file vào disk
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // 6. Lưu thông tin vào database
        Document doc = Document.builder()
            .uploader(uploader)
            .title(title)
            .fileUrl("/uploads/" + stored)
            .originalFilename(originalName)
            .fileType(ext.toUpperCase())
            .fileSize(file.getSize())
            .subject(subject)
            .description(description)
            .isPublic(isPublic)
            .build();

        documentRepository.save(doc);
        return toResponse(doc);
    }

    // ── Download file ───────────────────────────────────────────────────────────
    public Resource download(Long id) throws MalformedURLException {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài liệu"));

        // Kiểm tra quyền truy cập
        if (!doc.getIsPublic()) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            // Chỉ người upload hoặc Admin mới tải được file riêng tư
            if (!doc.getUploader().getEmail().equals(email)) {
                throw new IllegalArgumentException("Bạn không có quyền tải tài liệu này");
            }
        }

        // Tăng lượt tải
        documentRepository.incrementDownload(id);

        // Trả về file resource
        Path   uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String filename   = doc.getFileUrl().replace("/uploads/", "");
        Path   filePath   = uploadPath.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Không đọc được file. Vui lòng liên hệ Admin.");
        }
        return resource;
    }

    // ── Cập nhật tài liệu ──────────────────────────────────────────────────────
    @Transactional
    public DocumentResponse update(Long id, String title, String subject,
                                   String description, Boolean isPublic) {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài liệu"));

        checkOwnerOrAdmin(doc);

        if (title != null && !title.isBlank()) doc.setTitle(title);
        if (subject != null)     doc.setSubject(subject);
        if (description != null) doc.setDescription(description);
        if (isPublic != null)    doc.setIsPublic(isPublic);

        documentRepository.save(doc);
        return toResponse(doc);
    }

    // ── Xóa tài liệu ───────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id) throws IOException {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài liệu"));

        checkOwnerOrAdmin(doc);

        // Xóa file vật lý
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String filename = doc.getFileUrl().replace("/uploads/", "");
        Path   filePath = uploadPath.resolve(filename).normalize();
        Files.deleteIfExists(filePath);

        documentRepository.delete(doc);
    }

    // ── Tài liệu của tôi ───────────────────────────────────────────────────────
    public List<DocumentResponse> getMyDocuments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return documentRepository.findByUploaderIdOrderByCreatedAtDesc(user.getId())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("File không được để trống");
        long maxSize = 50L * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) throw new IllegalArgumentException("File vượt quá 50MB");

        String ext = getExtension(Objects.requireNonNull(file.getOriginalFilename()));
        List<String> allowed = List.of("pdf","docx","doc","pptx","ppt","xlsx","xls","mp4","zip","rar");
        if (!allowed.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("Loại file không được hỗ trợ: ." + ext);
        }
    }

    private void checkOwnerOrAdmin(Document doc) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg me  = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        boolean isOwner = doc.getUploader().getId().equals(me.getId());
        boolean isAdmin = me.getRole().equals("ADMIN") || me.getRole().equals("MANAGER");
        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }

    private String formatFileSize(Long bytes) {
        if (bytes == null) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }

    private String formatRelativeTime(LocalDateTime dt) {
        if (dt == null) return "—";
        long days = ChronoUnit.DAYS.between(dt, LocalDateTime.now());
        if (days == 0) return "Hôm nay";
        if (days == 1) return "1 ngày trước";
        if (days < 7)  return days + " ngày trước";
        if (days < 14) return "1 tuần trước";
        if (days < 30) return (days / 7) + " tuần trước";
        return (days / 30) + " tháng trước";
    }

    DocumentResponse toResponse(Document d) {
        return DocumentResponse.builder()
            .id(d.getId())
            .title(d.getTitle())
            .subject(d.getSubject())
            .fileUrl(d.getFileUrl())
            .fileType(d.getFileType())
            .originalFilename(d.getOriginalFilename())
            .description(d.getDescription())
            .isPublic(d.getIsPublic())
            .fileSize(d.getFileSize())
            .fileSizeFormatted(formatFileSize(d.getFileSize()))
            .downloadCount(d.getDownloadCount())
            .viewCount(d.getViewCount())
            .uploaderName(d.getUploader() != null ? d.getUploader().getFullName() : null)
            .uploaderId(d.getUploader() != null ? d.getUploader().getId() : null)
            .createdAt(d.getCreatedAt())
            .createdAtFormatted(formatRelativeTime(d.getCreatedAt()))
            .build();
    }
}

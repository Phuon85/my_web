package com.humg.olympic.controller;

import com.humg.olympic.dto.DocumentResponse;
import com.humg.olympic.dto.MessageResponse;
import com.humg.olympic.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * GET /api/documents
     * Lấy danh sách tài liệu công khai
     * Query params: subject, search
     */
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAll(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(documentService.getAll(subject, search));
    }

    /**
     * GET /api/documents/{id}
     * Chi tiết 1 tài liệu (đồng thời tăng lượt xem)
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    /**
     * POST /api/documents
     * Upload tài liệu mới — chỉ TEACHER, MANAGER, ADMIN
     * Content-Type: multipart/form-data
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("title")                        String title,
            @RequestParam(value = "subject",    required = false) String subject,
            @RequestParam(value = "description",required = false) String description,
            @RequestParam(value = "isPublic",   defaultValue = "true") boolean isPublic,
            @RequestParam("file")                         MultipartFile file) throws Exception {
        return ResponseEntity.ok(
            documentService.upload(title, subject, description, isPublic, file));
    }

    /**
     * PUT /api/documents/{id}
     * Cập nhật thông tin tài liệu (không đổi file)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<DocumentResponse> update(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Boolean isPublic) {
        return ResponseEntity.ok(
            documentService.update(id, title, subject, description, isPublic));
    }

    /**
     * DELETE /api/documents/{id}
     * Xóa tài liệu (owner hoặc Admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) throws Exception {
        documentService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa tài liệu thành công!"));
    }

    /**
     * GET /api/documents/{id}/download
     * Tải file về máy (tăng lượt download)
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws Exception {
        Resource resource = documentService.download(id);

        // Lấy tên file gốc từ document để đặt tên khi tải
        DocumentResponse doc = documentService.getById(id);
        String filename = doc.getOriginalFilename() != null
            ? doc.getOriginalFilename()
            : "document." + doc.getFileType().toLowerCase();

        return ResponseEntity.ok()
            .contentType(getMediaType(doc.getFileType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + filename + "\"")
            .body(resource);
    }

    /**
     * GET /api/documents/my
     * Tài liệu của chính mình đã upload
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<List<DocumentResponse>> myDocuments() {
        return ResponseEntity.ok(documentService.getMyDocuments());
    }

    // ── Helper: xác định Content-Type ──────────────────────────────────────────
    private MediaType getMediaType(String fileType) {
        if (fileType == null) return MediaType.APPLICATION_OCTET_STREAM;
        return switch (fileType.toUpperCase()) {
            case "PDF"  -> MediaType.APPLICATION_PDF;
            case "DOCX","DOC"  -> MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            case "PPTX","PPT"  -> MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.presentationml.presentation");
            case "XLSX","XLS"  -> MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case "MP4"  -> MediaType.parseMediaType("video/mp4");
            case "ZIP"  -> MediaType.parseMediaType("application/zip");
            default     -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}

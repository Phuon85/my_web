package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.*;
import com.humg.olympic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapRepository        roadmapRepository;
    private final RoadmapChapterRepository chapterRepository;
    private final RoadmapFileRepository    fileRepository;
    private final DocumentRepository       documentRepository;
    private final UserRepository           userRepository;
    private final DocumentService          documentService;

    public List<RoadmapResponse> getAll(String subject) {
        List<Roadmap> list = (subject != null && !subject.isBlank())
            ? roadmapRepository.findBySubjectAndIsActiveTrueOrderByCreatedAtDesc(subject)
            : roadmapRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public RoadmapResponse getById(Long id) {
        Roadmap roadmap = roadmapRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lộ trình"));
        return toResponseFull(roadmap);
    }

    @Transactional
    public RoadmapResponse create(CreateRoadmapRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg creator = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Roadmap roadmap = Roadmap.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .subject(req.getSubject())
            .creator(creator)
            .isActive(true)
            .visibility(Roadmap.Visibility.PUBLIC) // Mặc định public, có thể đổi theo req
            .build();

        roadmapRepository.save(roadmap);
        return toResponse(roadmap);
    }

    @Transactional
    public RoadmapResponse update(Long id, CreateRoadmapRequest req) {
        Roadmap roadmap = roadmapRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lộ trình"));

        if (req.getTitle() != null && !req.getTitle().isBlank()) roadmap.setTitle(req.getTitle());
        if (req.getDescription() != null) roadmap.setDescription(req.getDescription());
        if (req.getSubject() != null)     roadmap.setSubject(req.getSubject());

        roadmapRepository.save(roadmap);
        return toResponse(roadmap);
    }

    @Transactional
    public void delete(Long id) {
        Roadmap roadmap = roadmapRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lộ trình"));
        roadmapRepository.delete(roadmap);
    }

    @Transactional
    public RoadmapChapterResponse addChapter(Long roadmapId, CreateChapterRequest req) {
        Roadmap roadmap = roadmapRepository.findById(roadmapId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lộ trình"));

        int nextOrder = chapterRepository.findByRoadmapIdOrderByOrderIndexAsc(roadmapId).size();

        RoadmapChapter chapter = RoadmapChapter.builder()
            .roadmap(roadmap)
            .title(req.getTitle())
            .teacherNote(req.getTeacherNote())
            .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : nextOrder)
            .build();

        chapterRepository.save(chapter);
        return toChapterResponse(chapter, false);
    }

    @Transactional
    public RoadmapChapterResponse updateChapter(Long chapterId, CreateChapterRequest req) {
        RoadmapChapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chương"));

        if (req.getTitle() != null && !req.getTitle().isBlank()) chapter.setTitle(req.getTitle());
        if (req.getTeacherNote() != null) chapter.setTeacherNote(req.getTeacherNote());
        if (req.getOrderIndex() != null)  chapter.setOrderIndex(req.getOrderIndex());

        chapterRepository.save(chapter);
        return toChapterResponse(chapter, false);
    }

    @Transactional
    public void deleteChapter(Long chapterId) {
        RoadmapChapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chương"));
        chapterRepository.delete(chapter);
    }

    @Transactional
    public RoadmapFileResponse addFile(Long chapterId, AddFileRequest req) {
        RoadmapChapter chapter = chapterRepository.findById(chapterId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chương"));

        int nextOrder = fileRepository.findByChapterIdOrderByOrderIndexAsc(chapterId).size();

        RoadmapFile rf = RoadmapFile.builder()
            .chapter(chapter)
            .canPreview(req.getCanPreview() != null ? req.getCanPreview() : true)
            .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : nextOrder)
            .build();

        // Xử lý Phân loại Video vs Tài liệu
        if ("VIDEO_LINK".equalsIgnoreCase(req.getItemType())) {
            rf.setItemType(RoadmapFile.ItemType.VIDEO_LINK);
            rf.setExternalUrl(req.getExternalUrl());
            rf.setTitle(req.getTitle());
        } else {
            rf.setItemType(RoadmapFile.ItemType.DOCUMENT);
            Document document = documentRepository.findById(req.getDocumentId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài liệu"));
            rf.setDocument(document);
            rf.setTitle(document.getTitle());
        }

        fileRepository.save(rf);
        return toFileResponse(rf);
    }

    @Transactional
    public void removeFile(Long fileId) {
        RoadmapFile rf = fileRepository.findById(fileId)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy file"));
        fileRepository.delete(rf);
    }

    private RoadmapResponse toResponse(Roadmap r) {
        return RoadmapResponse.builder()
            .id(r.getId())
            .title(r.getTitle())
            .description(r.getDescription())
            .subject(r.getSubject())
            .creatorName(r.getCreator() != null ? r.getCreator().getFullName() : null)
            .createdAt(r.getCreatedAt())
            .build();
    }

    private RoadmapResponse toResponseFull(Roadmap r) {
        List<RoadmapChapterResponse> chapters =
            chapterRepository.findByRoadmapIdOrderByOrderIndexAsc(r.getId())
                .stream()
                .map(c -> toChapterResponse(c, true))
                .collect(Collectors.toList());

        return RoadmapResponse.builder()
            .id(r.getId())
            .title(r.getTitle())
            .description(r.getDescription())
            .subject(r.getSubject())
            .creatorName(r.getCreator() != null ? r.getCreator().getFullName() : null)
            .chapters(chapters)
            .createdAt(r.getCreatedAt())
            .build();
    }

    private RoadmapChapterResponse toChapterResponse(RoadmapChapter c, boolean includeFiles) {
        List<RoadmapFileResponse> files = null;
        if (includeFiles) {
            files = fileRepository.findByChapterIdOrderByOrderIndexAsc(c.getId())
                .stream().map(this::toFileResponse).collect(Collectors.toList());
        }
        int count = fileRepository.findByChapterIdOrderByOrderIndexAsc(c.getId()).size();

        return RoadmapChapterResponse.builder()
            .id(c.getId())
            .title(c.getTitle())
            .teacherNote(c.getTeacherNote())
            .orderIndex(c.getOrderIndex())
            .fileCount(count)
            .files(files)
            .updatedAt(c.getUpdatedAt())
            .build();
    }

    private RoadmapFileResponse toFileResponse(RoadmapFile rf) {
        boolean isVideo = rf.getItemType() == RoadmapFile.ItemType.VIDEO_LINK;
        Document d = rf.getDocument();

        return RoadmapFileResponse.builder()
            .id(rf.getId())
            .documentId(d != null ? d.getId() : null)
            .name(rf.getTitle() != null ? rf.getTitle() : (d != null ? d.getTitle() : null))
            .fileType(isVideo ? "VIDEO" : (d != null ? d.getFileType() : null)) 
            .size(isVideo ? null : (d != null ? documentService.toResponse(d).getFileSizeFormatted() : null))
            .fileUrl(isVideo ? rf.getExternalUrl() : (d != null ? "/api/documents/" + d.getId() + "/download" : null))
            .canPreview(rf.getCanPreview())
            .orderIndex(rf.getOrderIndex())
            .updatedAt(rf.getCreatedAt())
            .build();
    }
}
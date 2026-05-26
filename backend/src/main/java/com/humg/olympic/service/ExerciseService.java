package com.humg.olympic.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.humg.olympic.dto.*;
import com.humg.olympic.entity.*;
import com.humg.olympic.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository           exerciseRepo;
    private final ExerciseQuestionRepository   questionRepo;
    private final ExerciseSubmissionRepository submissionRepo;
    private final UserRepository               userRepo;
    private final ObjectMapper                 objectMapper;

    // ── Lấy user hiện tại ────────────────────────────────────────────────────
    private UserHumg currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private boolean isTeacherOrAdmin(UserHumg u) {
        return List.of("TEACHER","MANAGER","ADMIN").contains(u.getRole());
    }

    // ── LIST ──────────────────────────────────────────────────────────────────
    public List<ExerciseResponse> getAll(String subject, String level, String type) {
        String s = blank(subject), l = blank(level), t = blank(type);

        UserHumg u = null;
        try { u = currentUser(); } catch (Exception ignored) {}
        final UserHumg finalUser = u;

        List<Exercise> list = (finalUser != null && isTeacherOrAdmin(finalUser))
                ? exerciseRepo.findAllFiltered(s, l, t)
                : exerciseRepo.findPublished(s, l, t);

        return list.stream().map(ex -> toResponse(ex, finalUser, false))
                   .collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    public ExerciseResponse getById(Long id) {
        Exercise ex = findOrThrow(id);
        UserHumg u  = null;
        try { u = currentUser(); } catch (Exception ignored) {}
        // Non-published chỉ teacher+ xem được
        if (!ex.getIsPublished() && (u == null || !isTeacherOrAdmin(u)))
            throw new EntityNotFoundException("Bài tập không tồn tại");
        return toResponse(ex, u, true);   // true = include questions
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @Transactional
    public ExerciseResponse create(CreateExerciseRequest req) {
        UserHumg u = currentUser();
        Exercise ex = Exercise.builder()
                .creator(u)
                .title(req.getTitle())
                .description(req.getDescription())
                .subject(req.getSubject())
                .level(req.getLevel() != null ? req.getLevel() : "MEDIUM")
                .type(req.getType()   != null ? req.getType()  : "QUIZ")
                .durationMinutes(req.getDurationMinutes())
                .isPublished(Boolean.TRUE.equals(req.getIsPublished()))
                .allowRetake(req.getAllowRetake() == null || req.getAllowRetake())
                .build();
        exerciseRepo.save(ex);
        return toResponse(ex, u, false);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @Transactional
    public ExerciseResponse update(Long id, CreateExerciseRequest req) {
        Exercise ex = findOrThrow(id);
        if (req.getTitle()           != null) ex.setTitle(req.getTitle());
        if (req.getDescription()     != null) ex.setDescription(req.getDescription());
        if (req.getSubject()         != null) ex.setSubject(req.getSubject());
        if (req.getLevel()           != null) ex.setLevel(req.getLevel());
        if (req.getType()            != null) ex.setType(req.getType());
        if (req.getDurationMinutes() != null) ex.setDurationMinutes(req.getDurationMinutes());
        if (req.getAllowRetake()      != null) ex.setAllowRetake(req.getAllowRetake());
        exerciseRepo.save(ex);
        return toResponse(ex, currentUser(), false);
    }

    // ── PUBLISH / UNPUBLISH ───────────────────────────────────────────────────
    @Transactional
    public ExerciseResponse togglePublish(Long id) {
        Exercise ex = findOrThrow(id);
        ex.setIsPublished(!ex.getIsPublished());
        exerciseRepo.save(ex);
        return toResponse(ex, currentUser(), false);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id) {
        if (!exerciseRepo.existsById(id))
            throw new EntityNotFoundException("Không tìm thấy bài tập id=" + id);
        exerciseRepo.deleteById(id);
    }

    // ── ADD QUESTION ─────────────────────────────────────────────────────────
    @Transactional
    public QuestionResponse addQuestion(Long exerciseId, CreateQuestionRequest req) {
        Exercise ex = findOrThrow(exerciseId);
        int nextOrder = questionRepo.findMaxOrderIndex(exerciseId) + 1;

        ExerciseQuestion q = ExerciseQuestion.builder()
                .exercise(ex)
                .type(req.getType())
                .level(req.getLevel() != null ? req.getLevel() : "MEDIUM")
                .content(req.getContent())
                .imageUrl(req.getImageUrl())
                .choicesJson(toJson(req.getChoices()))
                .correctAnswer(answerToString(req.getCorrectAnswer()))
                .score(req.getScore() != null ? req.getScore() : 1.0)
                .hint(req.getHint())
                .orderIndex(nextOrder)
                .build();

        questionRepo.save(q);
        return toQuestionResponse(q, true);
    }

    // ── UPDATE QUESTION ───────────────────────────────────────────────────────
    @Transactional
    public QuestionResponse updateQuestion(Long exerciseId, Long questionId, CreateQuestionRequest req) {
        ExerciseQuestion q = questionRepo.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy câu hỏi"));
        if (!q.getExercise().getId().equals(exerciseId))
            throw new IllegalArgumentException("Câu hỏi không thuộc bài tập này");

        if (req.getType()          != null) q.setType(req.getType());
        if (req.getLevel()         != null) q.setLevel(req.getLevel());
        if (req.getContent()       != null) q.setContent(req.getContent());
        if (req.getImageUrl()      != null) q.setImageUrl(req.getImageUrl());
        if (req.getChoices()       != null) q.setChoicesJson(toJson(req.getChoices()));
        if (req.getCorrectAnswer() != null) q.setCorrectAnswer(answerToString(req.getCorrectAnswer()));
        if (req.getScore()         != null) q.setScore(req.getScore());
        if (req.getHint()          != null) q.setHint(req.getHint());

        questionRepo.save(q);
        return toQuestionResponse(q, true);
    }

    // ── DELETE QUESTION ───────────────────────────────────────────────────────
    @Transactional
    public void deleteQuestion(Long exerciseId, Long questionId) {
        ExerciseQuestion q = questionRepo.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy câu hỏi"));
        if (!q.getExercise().getId().equals(exerciseId))
            throw new IllegalArgumentException("Câu hỏi không thuộc bài tập này");
        questionRepo.delete(q);
    }

    // ── START (optional — chỉ log) ────────────────────────────────────────────
    public void start(Long exerciseId) {
        findOrThrow(exerciseId); // validate exists
        log.info("User {} started exercise {}", currentUser().getEmail(), exerciseId);
    }

    // ── SUBMIT ────────────────────────────────────────────────────────────────
    @Transactional
    public ExerciseResultResponse submit(Long exerciseId, SubmitExerciseRequest req) {
        UserHumg user = currentUser();
        Exercise ex   = findOrThrow(exerciseId);

        if (!ex.getIsPublished() && !isTeacherOrAdmin(user))
            throw new IllegalArgumentException("Bài tập chưa được công bố");

        List<ExerciseQuestion> questions =
                questionRepo.findByExerciseIdOrderByOrderIndexAsc(exerciseId);

        Map<String, Object> answers = req.getAnswers() != null ? req.getAnswers() : Map.of();

        // ── Chấm điểm tự động ───────────────────────────────────────────────
        double totalScore  = 0;
        double earnedScore = 0;
        int    correct     = 0;
        boolean hasEssay   = false;

        for (ExerciseQuestion q : questions) {
            totalScore += q.getScore();
            if ("ESSAY".equals(q.getType())) { hasEssay = true; continue; }

            String userAns = normalizeAnswer(answers.get(String.valueOf(q.getId())));
            String correctAns = q.getCorrectAnswer();

            if (correctAns != null && isCorrect(q.getType(), userAns, correctAns)) {
                earnedScore += q.getScore();
                correct++;
            }
        }

        // ── Lưu submission ───────────────────────────────────────────────────
        String answersJson = toJson(answers);
        String status = hasEssay ? "PENDING" : "AUTO";

        ExerciseSubmission sub = ExerciseSubmission.builder()
                .exercise(ex)
                .user(user)
                .answersJson(answersJson)
                .score(earnedScore)
                .totalScore(totalScore)
                .correctCount(correct)
                .totalQuestion(questions.size())
                .timeSpent(req.getTimeSpent())
                .tabSwitchCount(req.getTabSwitchCount() != null ? req.getTabSwitchCount() : 0)
                .status(status)
                .build();

        submissionRepo.save(sub);

        // ── Trả kết quả kèm đáp án đúng ─────────────────────────────────────
        return ExerciseResultResponse.builder()
                .submissionId(sub.getId())
                .score(earnedScore)
                .totalScore(totalScore)
                .correctCount(correct)
                .totalQuestion(questions.size())
                .timeSpent(req.getTimeSpent())
                .status(status)
                .answers(answers)
                .submittedAt(sub.getSubmittedAt())
                .build();
    }

    // ── MY RESULT ─────────────────────────────────────────────────────────────
    public ExerciseResultResponse myResult(Long exerciseId) {
        UserHumg user = currentUser();
        ExerciseSubmission sub = submissionRepo
                .findTopByExerciseIdAndUserIdOrderBySubmittedAtDesc(exerciseId, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Chưa có kết quả"));

        Map<String, Object> answers = fromJson(sub.getAnswersJson());
        return ExerciseResultResponse.builder()
                .submissionId(sub.getId())
                .score(sub.getScore())
                .totalScore(sub.getTotalScore())
                .correctCount(sub.getCorrectCount())
                .totalQuestion(sub.getTotalQuestion())
                .timeSpent(sub.getTimeSpent())
                .status(sub.getStatus())
                .answers(answers)
                .submittedAt(sub.getSubmittedAt())
                .build();
    }

    // ── GET RESULTS (teacher) ─────────────────────────────────────────────────
    public List<SubmissionResponse> getResults(Long exerciseId) {
        return submissionRepo.findByExerciseIdOrderByScoreDescSubmittedAtAsc(exerciseId)
                .stream()
                .map(s -> SubmissionResponse.builder()
                        .id(s.getId())
                        .userId(s.getUser().getId())
                        .userName(s.getUser().getFullName())
                        .userEmail(s.getUser().getEmail())
                        .score(s.getScore())
                        .totalScore(s.getTotalScore())
                        .correctCount(s.getCorrectCount())
                        .totalQuestion(s.getTotalQuestion())
                        .timeSpent(s.getTimeSpent())
                        .tabSwitchCount(s.getTabSwitchCount())
                        .status(s.getStatus())
                        .submittedAt(s.getSubmittedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Exercise findOrThrow(Long id) {
        return exerciseRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài tập id=" + id));
    }

    private String blank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    @SuppressWarnings("unchecked")
    private String toJson(Object obj) {
        if (obj == null) return null;
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return obj.toString(); }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fromJson(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (Exception e) { return Map.of(); }
    }

    @SuppressWarnings("unchecked")
    private List<String> choicesFromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (Exception e) { return List.of(); }
    }

    /** Chuyển correctAnswer (String hoặc List) về String lưu DB */
    @SuppressWarnings("unchecked")
    private String answerToString(Object ans) {
        if (ans == null) return null;
        if (ans instanceof List) {
            return ((List<String>) ans).stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
        }
        return ans.toString();
    }

    /** Normalize user answer thành chuỗi so sánh */
    private String normalizeAnswer(Object ans) {
        if (ans == null) return "";
        if (ans instanceof List) {
            List<?> list = (List<?>) ans;
            return list.stream().map(Object::toString).sorted().collect(Collectors.joining(","));
        }
        return ans.toString().trim();
    }

    /** Kiểm tra đáp án đúng/sai */
    private boolean isCorrect(String type, String userAns, String correctAns) {
        if (userAns == null || userAns.isBlank()) return false;
        if ("SINGLE".equals(type) || "QUIZ".equals(type)) {
            return correctAns.trim().equalsIgnoreCase(userAns.trim());
        }
        if ("MULTIPLE".equals(type)) {
            // Sort cả hai rồi so sánh
            String sortedCorrect = Arrays.stream(correctAns.split(","))
                    .map(String::trim).sorted().collect(Collectors.joining(","));
            String sortedUser    = Arrays.stream(userAns.split(","))
                    .map(String::trim).sorted().collect(Collectors.joining(","));
            return sortedCorrect.equalsIgnoreCase(sortedUser);
        }
        if ("SHORT_ANSWER".equals(type)) {
            return correctAns.trim().equalsIgnoreCase(userAns.trim());
        }
        return false; // ESSAY — chấm tay
    }

    // ── toResponse ────────────────────────────────────────────────────────────
    private ExerciseResponse toResponse(Exercise ex, UserHumg currentUser, boolean includeQuestions) {
        long submissionCount = submissionRepo.countByExerciseId(ex.getId());
        int  questionCount   = (int) questionRepo.countByExerciseId(ex.getId());

        // Kết quả của user hiện tại
        MyResultSummary myResult = null;
        if (currentUser != null && !isTeacherOrAdmin(currentUser)) {
            myResult = submissionRepo
                    .findTopByExerciseIdAndUserIdOrderBySubmittedAtDesc(ex.getId(), currentUser.getId())
                    .map(s -> MyResultSummary.builder()
                            .score(s.getScore())
                            .totalScore(s.getTotalScore())
                            .correctCount(s.getCorrectCount())
                            .totalQuestion(s.getTotalQuestion())
                            .timeSpent(s.getTimeSpent())
                            .build())
                    .orElse(null);
        }

        // Questions (ẩn đáp án đúng khi học sinh xem trước khi làm)
        List<QuestionResponse> questions = null;
        if (includeQuestions) {
            boolean showAnswers = currentUser != null && isTeacherOrAdmin(currentUser);
            questions = questionRepo.findByExerciseIdOrderByOrderIndexAsc(ex.getId())
                    .stream()
                    .map(q -> toQuestionResponse(q, showAnswers))
                    .collect(Collectors.toList());
        }

        return ExerciseResponse.builder()
                .id(ex.getId())
                .title(ex.getTitle())
                .description(ex.getDescription())
                .subject(ex.getSubject())
                .level(ex.getLevel())
                .type(ex.getType())
                .durationMinutes(ex.getDurationMinutes())
                .isPublished(ex.getIsPublished())
                .allowRetake(ex.getAllowRetake())
                .creatorName(ex.getCreator() != null ? ex.getCreator().getFullName() : null)
                .questionCount(questionCount)
                .submissionCount(submissionCount)
                .questions(questions)
                .createdAt(ex.getCreatedAt())
                .myResult(myResult)
                .build();
    }

    private QuestionResponse toQuestionResponse(ExerciseQuestion q, boolean showAnswer) {
        List<String> choices = choicesFromJson(q.getChoicesJson());

        Object correctAnswer = null;
        if (showAnswer && q.getCorrectAnswer() != null) {
            if ("MULTIPLE".equals(q.getType())) {
                correctAnswer = Arrays.asList(q.getCorrectAnswer().split(","));
            } else {
                correctAnswer = q.getCorrectAnswer();
            }
        }

        return QuestionResponse.builder()
                .id(q.getId())
                .type(q.getType())
                .level(q.getLevel())
                .content(q.getContent())
                .imageUrl(q.getImageUrl())
                .choices(choices.isEmpty() ? null : choices)
                .correctAnswer(correctAnswer)
                .score(q.getScore())
                .hint(showAnswer ? q.getHint() : null)  // chỉ hiện hint sau khi nộp
                .orderIndex(q.getOrderIndex())
                .build();
    }
}

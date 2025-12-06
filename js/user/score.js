const scoreData = JSON.parse(localStorage.getItem("lastScore"));
const quizId = localStorage.getItem("currentQuiz");
const allForms = JSON.parse(localStorage.getItem("forms")) || [];
const quiz = allForms.find(f => Number(f.formId) === Number(quizId));
const userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (scoreData && quiz && currentUser) {
    let testAttempts = JSON.parse(localStorage.getItem("testAttempts")) || [];
    
    const answerDetails = quiz.questions.map((q, i) => {
        let correctAnswer = "N/A";
        let userAnswer = userAnswers[i] || "No answer";
        
        if (q.questionType === "radio" || q.questionType === "select") {
            const correctOpt = q.options?.find(opt => opt.isCorrect);
            correctAnswer = correctOpt ? correctOpt.optionContent : "N/A";
        } else if (q.questionType === "text") {
            correctAnswer = q.correctAnswer || "N/A";
        }
        
        const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        
        return {
            questionId: q.questionId || i + 1,
            questionTitle: q.questionTitle,
            questionType: q.questionType,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        };
    });
    
    const attempt = {
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.email,
        userEmail: currentUser.email,
        testId: Number(quizId),
        testTitle: quiz.formTitle,
        score: scoreData.score,
        total: scoreData.total,
        completedAt: new Date().toISOString(),
        answerDetails: answerDetails
    };
    
    testAttempts.push(attempt);
    localStorage.setItem("testAttempts", JSON.stringify(testAttempts));
}

if (scoreData && quiz) {
    document.getElementById("scoreDisplay").textContent = `${scoreData.score}/${scoreData.total}`;
    
    const percentage = Math.round((scoreData.score / scoreData.total) * 100);
    
    let level = "Beginner";
    let feedback = "Keep practicing!";
    if (percentage >= 90) {
        level = "Excellent";
        feedback = "Outstanding performance! You have mastered this test.";
    } else if (percentage >= 75) {
        level = "Advanced";
        feedback = "Great job! You have a strong understanding.";
    } else if (percentage >= 60) {
        level = "Intermediate";
        feedback = "Good work! Keep practicing to improve.";
    } else if (percentage >= 50) {
        level = "Beginner";
        feedback = "You're on the right track. Review the material and try again.";
    } else {
        level = "Needs Improvement";
        feedback = "Don't give up! Review the questions and study more.";
    }
    
    document.getElementById("levelDisplay").textContent = level;
    document.getElementById("feedbackText").textContent = feedback;
    document.getElementById("motivationalTitle").textContent = level === "Excellent" ? "Excellent Work!" : level === "Advanced" ? "Great Job!" : "Keep Going!";
    document.getElementById("motivationalText").textContent = feedback;
    
    const tbody = document.getElementById("resultsTableBody");
    tbody.innerHTML = "";
    
    quiz.questions.forEach((q, i) => {
        let correctAnswer = "N/A";
        let userAnswer = userAnswers[i] || "No answer";
        
        if (q.questionType === "radio" || q.questionType === "select") {
            const correctOpt = q.options?.find(opt => opt.isCorrect);
            correctAnswer = correctOpt ? correctOpt.optionContent : "N/A";
        } else if (q.questionType === "text") {
            correctAnswer = q.correctAnswer || "N/A";
        }
        
        const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        const statusClass = isCorrect ? "success" : "danger";
        const statusIcon = isCorrect ? "bi-check-circle-fill" : "bi-x-circle-fill";
        const statusText = isCorrect ? "Correct" : "Incorrect";
        
        tbody.innerHTML += `
            <tr class="${isCorrect ? 'table-success' : 'table-danger'}">
                <td><strong>Q${i + 1}:</strong> ${q.questionTitle}</td>
                <td>${userAnswer}</td>
                <td>${correctAnswer}</td>
                <td>
                    <span class="badge bg-${statusClass}">
                        <i class="bi ${statusIcon} me-1"></i>${statusText}
                    </span>
                </td>
            </tr>
        `;
    });
}


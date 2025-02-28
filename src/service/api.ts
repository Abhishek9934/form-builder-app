import { Question } from "../interfaces/Question.Interface";

export const simulateApiSave = (question: Question): Promise<Question> => {
    return new Promise((resolve, reject) => {
        const delay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error("Auto-save failed for this question."));
            } else {
                resolve(question);
            }
        }, delay);
    });
};

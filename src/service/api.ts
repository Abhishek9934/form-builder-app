import { Question } from "../interfaces/Question.Interface";

export const simulateApiSave = (question: Question): Promise<Question> => {
    return new Promise((resolve, reject) => {
        const delay = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
            if (Math.random() < 0.2) {
                const errorResponses = [
                    { status: 400, message: "Invalid question format", code: "INVALID_FORMAT" },
                    { status: 401, message: "Unauthorized access", code: "UNAUTHORIZED" },
                    { status: 403, message: "Permission denied", code: "FORBIDDEN" },
                    { status: 500, message: "Internal server error", code: "SERVER_ERROR" }
                ];
                
                const randomError = errorResponses[Math.floor(Math.random() * errorResponses.length)];
                const error = new Error(randomError.message);
                Object.assign(error, {
                    status: randomError.status,
                    statusText: randomError.message,
                    code: randomError.code,
                    response: {
                        data: {
                            error: randomError.code,
                            message: randomError.message,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
                
                reject(error);
            } else {
                const updatedQuestion = {
                    ...question,
                    lastUpdated: new Date().toISOString()
                };
                resolve(updatedQuestion);
            }
        }, delay);
    });
};
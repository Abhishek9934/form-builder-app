import React, { useState, useEffect } from 'react';
import { Question } from '../interfaces/Question.Interface';
import {
    FormControl,
    FormLabel,
    Input,
    Select,
    FormErrorMessage,
    Button,
    Box,
    Text,
    FormHelperText,
} from '@chakra-ui/react';

interface FormValues {
    [key: string]: string | number;
}

interface FieldErrors {
    [key: string]: string;
}

const FormRenderer: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [formValues, setFormValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('formData');
        if (stored) {
            const parsed: Question[] = JSON.parse(stored);
            // Filter out hidden questions
            const visibleQuestions = parsed.filter(q => !q.hidden);
            setQuestions(visibleQuestions);
            const initialValues: FormValues = {};
            visibleQuestions.forEach(q => {
                initialValues[q.id] = '';
            });
            setFormValues(initialValues);
        }
    }, []);

    const handleInputChange = (id: string, value: string | number) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
        setErrors(prev => ({ ...prev, [id]: '' }));
    };

    const validateField = (question: Question, value: string | number): string => {
        if (question.required && (value === undefined || value.toString().trim() === '')) {
            return 'This field is required.';
        }

        if (question.type === 'number') {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                return 'Must be a number.';
            }
            if (question.min !== undefined && numValue < question.min) {
                return `Must be at least ${question.min}.`;
            }
            if (question.max !== undefined && numValue > question.max) {
                return `Must be no more than ${question.max}.`;
            }
        }
        return '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let valid = true;
        const newErrors: FieldErrors = {};

        questions.forEach(question => {
            const value = formValues[question.id];
            const errorMsg = validateField(question, value || '');
            if (errorMsg) {
                valid = false;
                newErrors[question.id] = errorMsg;
            }
        });

        setErrors(newErrors);

        if (valid) {
            setSubmittedValues(formValues);
            alert("Form submitted successfully. Check console for details.");
            console.log('Form submission:', formValues);
        }
    };

    return (
        <Box>
            <form onSubmit={handleSubmit}>
                {questions.map(question => (
                    <FormControl key={question.id} isInvalid={!!errors[question.id]} mb={4}>
                        <FormLabel htmlFor={`field-${question.id}`}>{question.label}</FormLabel>
                        {question.helperText && (
                            <FormHelperText>{question.helperText}</FormHelperText>
                        )}

                        {question.type === 'text' && (
                            <Input
                                id={`field-${question.id}`}
                                type="text"
                                value={formValues[question.id]?.toString() || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                isRequired={question.required}
                            />
                        )}

                        {question.type === 'number' && (
                            <>
                                <Input
                                    id={`field-${question.id}`}
                                    type="number"
                                    value={formValues[question.id]?.toString() || ''}
                                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                                    isRequired={question.required}
                                    aria-describedby={`number-details-${question.id}`}
                                />
                                {question.numberType && <span> {question.numberType}</span>}
                                {question.min !== undefined && question.max !== undefined && (
                                    <FormHelperText id={`number-details-${question.id}`}>
                                        Range: {question.min} - {question.max}
                                    </FormHelperText>
                                )}
                            </>
                        )}

                        {question.type === 'select' && (
                            <Select
                                id={`field-${question.id}`}
                                value={formValues[question.id]?.toString() || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                isRequired={question.required}
                            >
                                <option value="">Select an option</option>
                                {question.options &&
                                    question.options.map((option, idx) => (
                                        <option key={idx} value={option}>
                                            {option}
                                        </option>
                                    ))}
                            </Select>
                        )}
                        <FormErrorMessage>{errors[question.id]}</FormErrorMessage>
                    </FormControl>
                ))}
                <Button colorScheme="blue" type="submit">Submit Form</Button>
            </form>
            {submittedValues && (
                <Box mt={4}>
                    <Text fontWeight="bold">Submitted Values:</Text>
                    <Text as="pre">{JSON.stringify(submittedValues, null, 2)}</Text>
                </Box>
            )}
        </Box>
    );
};

export default FormRenderer;
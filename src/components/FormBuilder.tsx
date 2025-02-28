import React, { useState, useRef } from 'react';
import { Question } from "../interfaces/Question.Interface";
import { simulateApiSave } from '../service/api';
import {
    Box,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Select,
    Checkbox,
    IconButton,
    Text,
    Spinner,
    Tooltip,
    useToast,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons';
import FormRenderer from './FormRenderer';

const FormBuilder: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const autoSaveTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [renderKey, setRenderKey] = useState(0); // Force re-render

    const isValidQuestion = (question: Question): boolean => {
        return question.label.trim() !== '';
    };

    const updateLocalStorage = (updatedQuestions: Question[]) => {
        localStorage.setItem('formData', JSON.stringify(updatedQuestions));
    };

    const handleAutoSave = (question: Question) => {
        if (!isValidQuestion(question)) {
            toast({
                title: "Invalid question, cannot save.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setQuestions(prev =>
            prev.map(q =>
                q.id === question.id ? { ...q, saveStatus: "saving", error: undefined } : q
            )
        );

        simulateApiSave(question)
            .then(() => {
                setQuestions(prev => {
                    const newQuestions: Question[] = prev.map(q =>
                        q.id === question.id ? { ...q, saveStatus: "saved", error: undefined } : q
                    );
                    updateLocalStorage(newQuestions);
                    toast({
                        title: `Question "${question.label}" saved.`,
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                    });

                    return newQuestions;
                });
            })
            .catch(err => {
                setQuestions(prev =>
                    prev.map(q =>
                        q.id === question.id
                            ? { ...q, saveStatus: "error", error: err.message }
                            : q
                    )
                );
                toast({
                    title: "Auto-save failed.",
                    description: err.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            });
    };

    const scheduleAutoSave = (question: Question) => {
        if (autoSaveTimers.current.has(question.id)) {
            clearTimeout(autoSaveTimers.current.get(question.id));
        }
        const timer = setTimeout(() => {
            handleAutoSave(question);
            autoSaveTimers.current.delete(question.id);
        }, 2000);
        autoSaveTimers.current.set(question.id, timer);
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type: 'text', // Default type
            label: '',
            required: false,
            hidden: false,
            saveStatus: "initial",
            helperText: '',
            numberType: 'Years',
            min: 0,
            max: 100,
        };
        const newQuestions = [...questions, newQuestion];
        setQuestions(newQuestions);
        updateLocalStorage(newQuestions);
        setRenderKey(prevKey => prevKey + 1);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(prev =>
            prev.map(q => {
                if (q.id === id) {
                    const updatedQuestion = { ...q, ...updates };
                    scheduleAutoSave(updatedQuestion);
                    return updatedQuestion;
                }
                return q;
            })
        );
        setRenderKey(prevKey => prevKey + 1);
    };

    const deleteQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setRenderKey(prevKey => prevKey + 1);
    };

    const handleRenderForm = () => {
        updateLocalStorage(questions);
        onOpen();
    };

    return (
        <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
                Form Builder
            </Text>

            <Accordion allowMultiple>
                {questions.map((question, index) => (
                    <AccordionItem key={question.id}>
                        {({ isExpanded }) => (
                            <>
                                <AccordionButton>
                                    <Box as="span" flex='1' textAlign='left'>
                                        {question.label || `Question ${index + 1}`}
                                    </Box>
                                    <Flex align="center">
                                        {question.saveStatus === "saving" && (
                                            <Tooltip label="Saving...">
                                                <Spinner size="sm" mr={2} />
                                            </Tooltip>
                                        )}
                                        {question.saveStatus === "initial" && (
                                            <Tooltip label="Incomplete question">
                                                <Text mr={2}>
                                                    <svg width="18px" height="18px" viewBox="0 0 24 24" fill="blue" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M19.5 12C19.5 16.1421 16.1421 19.5 12 19.5C7.85786 19.5 4.5 16.1421 4.5 12C4.5 7.85786 7.85786 4.5 12 4.5C16.1421 4.5 19.5 7.85786 19.5 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM11.25 13.5V8.25H12.75V13.5H11.25ZM11.25 15.75V14.25H12.75V15.75H11.25Z" fill="#080341" />
                                                    </svg>
                                                </Text>

                                            </Tooltip>
                                        )}
                                        {question.error && (
                                            <Tooltip label={question.error}>
                                                <Text color="red.500" mr={2}>
                                                    <svg fill="#ac0c0c" width="19px" height="19px" viewBox="-1.7 0 20.4 20.4" xmlns="http://www.w3.org/2000/svg" className="cf-icon-svg" stroke="#ac0c0c">
                                                        <g id="SVGRepo_bgCarrier" stroke-width="0" />
                                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />
                                                        <g id="SVGRepo_iconCarrier">
                                                            <path d="M16.417 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.917 7.917zm-6.804.01 3.032-3.033a.792.792 0 0 0-1.12-1.12L8.494 9.173 5.46 6.14a.792.792 0 0 0-1.12 1.12l3.034 3.033-3.033 3.033a.792.792 0 0 0 1.12 1.119l3.032-3.033 3.033 3.033a.792.792 0 0 0 1.12-1.12z" />
                                                        </g>
                                                    </svg>
                                                </Text>
                                            </Tooltip>
                                        )}
                                        {question.saveStatus === "saved" && (
                                            <Text color="green.500" mr={2}>
                                                <CheckCircleIcon />
                                            </Text>
                                        )}
                                    </Flex>
                                    <IconButton
                                        aria-label="Delete question"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteQuestion(question.id);
                                        }}
                                        mr={2}
                                    />
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4}>
                                    <Box
                                        borderWidth="1px"
                                        borderRadius="md"
                                        p={4}
                                        mb={4}
                                        bg="white"
                                        boxShadow="sm"
                                    >
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <FormControl>
                                                <FormLabel htmlFor={`question-title-${question.id}`}>
                                                    Question title *
                                                </FormLabel>
                                                <Input
                                                    id={`question-title-${question.id}`}
                                                    type="text"
                                                    value={question.label}
                                                    onChange={(e) =>
                                                        updateQuestion(question.id, { label: e.target.value })
                                                    }
                                                    placeholder="Enter question title"
                                                />
                                            </FormControl>

                                        </Flex>

                                        <FormControl mb={2}>
                                            <FormLabel htmlFor={`question-type-${question.id}`}>
                                                Question Type *
                                            </FormLabel>
                                            <Select
                                                id={`question-type-${question.id}`}
                                                value={question.type}
                                                onChange={(e) =>
                                                    updateQuestion(question.id, {
                                                        type: e.target.value as 'text' | 'number' | 'select',
                                                    })
                                                }
                                            >
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="select">Select</option>
                                            </Select>
                                        </FormControl>

                                        {question.type === 'number' && (
                                            <>
                                                <FormControl mb={2}>
                                                    <FormLabel htmlFor={`number-type-${question.id}`}>
                                                        Number Type *
                                                    </FormLabel>
                                                    <Select
                                                        id={`number-type-${question.id}`}
                                                        value={question.numberType}
                                                        onChange={(e) => updateQuestion(question.id, { numberType: e.target.value })}
                                                    >
                                                        <option value="Years">Years</option>
                                                        <option value="Other">Other</option>
                                                    </Select>
                                                </FormControl>

                                                <Flex mb={2}>
                                                    <FormControl mr={2}>
                                                        <FormLabel htmlFor={`min-${question.id}`}>Min</FormLabel>
                                                        <Input
                                                            id={`min-${question.id}`}
                                                            type="number"
                                                            value={question.min}
                                                            onChange={(e) => updateQuestion(question.id, { min: Number(e.target.value) })}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel htmlFor={`max-${question.id}`}>Max</FormLabel>
                                                        <Input
                                                            id={`max-${question.id}`}
                                                            type="number"
                                                            value={question.max}
                                                            onChange={(e) => updateQuestion(question.id, { max: Number(e.target.value) })}
                                                        />
                                                    </FormControl>
                                                </Flex>
                                            </>
                                        )}
                                        <FormControl mb={2}>
                                            <FormLabel htmlFor={`helper-text-${question.id}`}>Helper Text</FormLabel>
                                            <Input
                                                id={`helper-text-${question.id}`}
                                                type="text"
                                                value={question.helperText}
                                                onChange={(e) =>
                                                    updateQuestion(question.id, { helperText: e.target.value })
                                                }
                                                placeholder="Enter helper text"
                                            />
                                        </FormControl>

                                        {question.type === 'select' && (
                                            <FormControl mb={2}>
                                                <FormLabel htmlFor={`select-options-${question.id}`}>Select Options</FormLabel>
                                                <Input
                                                    id={`select-options-${question.id}`}
                                                    type="text"
                                                    placeholder="Comma-separated options"
                                                    onChange={(e) => {
                                                        const options = e.target.value
                                                            .split(',')
                                                            .map(opt => opt.trim())
                                                            .filter(opt => opt !== '');
                                                        updateQuestion(question.id, { options });
                                                    }}
                                                />
                                            </FormControl>
                                        )}

                                        <Flex align="center" justify="space-between">
                                            <FormControl display="flex" alignItems="center">
                                                <Checkbox
                                                    id={`required-${question.id}`}
                                                    isChecked={question.required}
                                                    onChange={(e) =>
                                                        updateQuestion(question.id, { required: e.target.checked })
                                                    }
                                                    mr={2}
                                                />
                                                <FormLabel htmlFor={`required-${question.id}`} mb="0">
                                                    Required
                                                </FormLabel>
                                            </FormControl>

                                            <FormControl display="flex" alignItems="center">
                                                <Checkbox
                                                    id={`hidden-${question.id}`}
                                                    isChecked={question.hidden}
                                                    onChange={(e) =>
                                                        updateQuestion(question.id, { hidden: e.target.checked })
                                                    }
                                                    mr={2}
                                                />
                                                <FormLabel htmlFor={`hidden-${question.id}`} mb="0">
                                                    Hidden
                                                </FormLabel>
                                            </FormControl>
                                        </Flex>
                                    </Box>
                                </AccordionPanel>
                            </>
                        )}
                    </AccordionItem>
                ))}
            </Accordion>

            <Flex justify="space-between" align="center" mb={4} mt={4}>
                <Button colorScheme="blue" onClick={addQuestion}>
                    + Add Question
                </Button>
                <Button colorScheme="green" onClick={handleRenderForm}>
                    Render Form
                </Button>
            </Flex>

            {/* Modal for Rendering the Form: */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Form Preview</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormRenderer key={renderKey} />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default FormBuilder;
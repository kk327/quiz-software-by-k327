<script setup>
    import { ref, watch } from 'vue';

    const props = defineProps([
        "editedQuestionData", 
        "questions",
        "popupVisible"
    ]);

    const emit = defineEmits([
        "addQuestion"
    ]);

    const answers = ref([]);
    const question = ref("");
    const answer = ref("");
    const correctAnswer = ref(-1);
    const correctAnswers = ref([]);
    const questionType = ref("single");
    const image = ref("");
    const altText = ref("");

    watch(() => props.editedQuestionData, () => {
        if (props.editedQuestionData) {
            answers.value = props.editedQuestionData.answers;
            question.value = props.editedQuestionData.question;
            questionType.value = props.editedQuestionData.questionType;
            answer.value = "";

            if ("image" in props.editedQuestionData) {
                image.value = props.editedQuestionData.image;
                altText.value = props.editedQuestionData.altText;
            } else {
                image.value = "";
                altText.value = "";
            }

            if (props.editedQuestionData.questionType == "single") {
                correctAnswer.value = props.editedQuestionData.correct;
            } else {
                correctAnswers.value = props.editedQuestionData.correct;
            }
        }
    })

    function addAnswer() {
        answers.value.push(answer.value);
        answer.value = "";
        correctAnswers.value.push(false);
    }

    function finish() {
        let questionData = { question: question.value,
                             answers: answers.value,
                             correct: questionType.value == "single" ? correctAnswer.value : correctAnswers.value,
                             questionType: questionType.value }

        if (image.value.trim()) {
            questionData = { ...questionData, 
                             image: image.value,
                             altText: altText.value }
        }

        emit("addQuestion", questionData);
            
        answers.value = [];
        answer.value = "";
        question.value = "";
        correctAnswer.value = -1;
        correctAnswers.value = [];
        image.value = "";
        altText.value = "";
    }

    function deleteAnswer(index) {
        if (questionType.value == "single") {
            if (index == correctAnswer.value) {
                correctAnswer.value = -1;
            } else if (index < correctAnswer.value) {
                correctAnswer.value -= 1;
            }
        } else {
            correctAnswers.value.splice(index, 1);
        }

        answers.value.splice(index, 1);
    }
</script>

<template>
    <section class="w-[calc(100vw-32px)] max-w-[800px] bg-neutral-125 dark:bg-neutral-900 mt-8 first-of-type:mt-4 rounded-2xl flex flex-col items-center">
        <section class="m-4">
            <p>Question type:</p>
            <label class="m-2 cursor-pointer">
                <input 
                    type="radio"
                    class="cursor-pointer"
                    value="single"
                    name="questionType"
                    v-model="questionType"
                    checked
                    :tabIndex="popupVisible ? -1 : ''"
                >
                Single choice
            </label>
            <label class="m-2 cursor-pointer">
                <input 
                    type="radio"
                    class="cursor-pointer"
                    value="multi"
                    name="questionType"
                    v-model="questionType"
                    :tabIndex="popupVisible ? -1 : ''"
                >
                Multi choice
            </label>
        </section>

        <label>
            Question:
            <input 
                type="text" 
                v-model="question"
                class="w-[600px] max-w-[calc(100vw-170px)] ml-1"
                :tabIndex="popupVisible ? -1 : ''"
            >
        </label>
        
        <p class="m-2 mt-4">Answers:</p>
        <p 
            v-if="answers.length == 0"
            class="text-neutral-400 dark:text-neutral-500"
        >None yet</p>
        <label
            v-for="answer, index in answers"
            class="my-0.5 cursor-pointer"
        > 
            <input 
                v-if="questionType == 'single'"
                type="radio"
                class="cursor-pointer"
                name="answers"
                :value="index"
                v-model="correctAnswer"
                :tabIndex="popupVisible ? -1 : ''"
            >
            <input
                v-else
                type="checkbox"
                class="cursor-pointer"
                v-model="correctAnswers[index]"
                :tabIndex="popupVisible ? -1 : ''"
            >
            {{ answer }}
            <button
                @click="deleteAnswer(index)"
                class="ml-1 h-8 w-8 p-0 inline-flex justify-center items-center"
                :tabIndex="popupVisible ? -1 : ''"
            ><img 
                src="@/assets/x.png"
                alt="x"
                title="Remove answer"
                class="w-3 h-3"
            ></button>
        </label>

        <label class="m-4 mb-2">
            Answer:
            <input 
                type="text"
                v-model="answer"
                class="w-[555px] max-w-[calc(100vw-215px)] mx-1"
                :tabIndex="popupVisible ? -1 : ''"
            >
            <button 
                @click="addAnswer()"
                :disabled="!answer.trim() || answers.includes(answer)"
                :tabIndex="popupVisible ? -1 : ''"
                :title="!answer.trim() ? 
                            'Type the answer first' 
                            : answers.includes(answer) 
                                ? 'This answer already exists' 
                                : ''"
            >Add</button>
        </label>

        <section class="flex justify-center flex-wrap">
            <label class="my-2">
                Image link (optional):<br>
                <input 
                    type="text"
                    v-model="image"
                    class="m-2 mb-0"
                    :tabIndex="popupVisible ? -1 : ''"
                >
            </label>
            <label 
                v-if="image.trim()"
                class="my-2"
            >
                Image alternative text:<br>
                <input 
                    type="text"
                    v-model="altText"
                    class="m-2 mb-0"
                    :tabIndex="popupVisible ? -1 : ''"
                >
            </label>
        </section>

        <button
            class="m-4 mt-2"
            @click="finish()"
            :disabled="!question.trim() || answers.length < 2 || (correctAnswer == -1 && questionType == 'single') || (image.trim() && !altText) || (questions.includes(question.trim()) && !editedQuestionData)"
            :tabIndex="popupVisible ? -1 : ''"
            :title="!question.trim() ? 
                        'Type the question first' 
                        : answers.length < 2 ? 
                            'You have to add at least 2 answers' 
                            : correctAnswer == -1 && questionType == 'single' ? 
                                'Select the correct answer first' 
                                : image.trim() && !altText ? 
                                    'Add alternative text for the image first' 
                                    : questions.includes(question.trim()) && !editedQuestionData ?
                                        'This question already exists'
                                        : ''"
        >{{ editedQuestionData ? "Save question" : "Add question" }}</button>
    </section>
</template>
<script setup>
    import { ref } from 'vue';

    const props = defineProps([
        "questionData",
        "questionIndex",
        "answersShown",
        "correctAnswersShown",
        "selectedAnswer",
        "questionAmount",
        "editingQuestion",
        "popupVisible"
    ]);

    const imageLoadFailed = ref(false);
    
    function getAnswerColor(index) {
        return props.answersShown ?
                    props.questionData.questionType == 'single' ?
                        props.selectedAnswer == index ?
                            props.questionData.correct == index ? '#a6ff7a' : '#ff7a7a' 
                            : props.questionData.correct == index ? '#a6ff7a' : ''
                        : props.selectedAnswer[index] != props.questionData.correct[index] ?
                            props.correctAnswersShown ?
                                props.questionData.correct[index] ? '#a6ff7a' : '' 
                                : '#ff7a7a'
                            : props.questionData.correct[index] ? '#a6ff7a' : ''
                    : '';  
    }
</script>

<template>
    <section class="w-[calc(100vw-32px)] max-w-[800px] bg-neutral-125 dark:bg-neutral-900 mt-8 first-of-type:mt-4 p-2 rounded-2xl flex flex-col items-center">
        <h3 
            v-if="editingQuestion"
            class="font-bold text-xl m-2 text-neutral-500"
        >Currently editing this question</h3>
        <h1 class="font-bold p-1 text-lg">{{ questionData.question }}</h1>
        <label
            v-for="answer, index of questionData.answers"
            class="rounded-2xl py-1 px-2 m-1"
            :style="{ backgroundColor: getAnswerColor(index),
                      cursor: answersShown ? 'default' : 'pointer',
                      color: getAnswerColor(index) ? '#262626' : '' }"
        >
            <input 
                :style="{ cursor: answersShown ? 'default' : 'pointer' }"
                :type="questionData.questionType == 'single' ? 'radio' : 'checkbox'"
                :name="questionIndex"
                :disabled="answersShown"
                :checked="correctAnswersShown && (questionData.correct == index || questionData.correct[index])"
                :tabIndex="popupVisible ? -1 : ''"
                @change="$emit('selected', index)"
            >
            {{ answer }}

            <img 
                v-if="getAnswerColor(index) == '#a6ff7a'"
                class="h-3 float-right mt-1.5 ml-1 brightness-[0.15]"
                src="@/assets/v.png"
                alt="v"
                title="Correct"
            >
            <img 
                v-else-if="getAnswerColor(index) == '#ff7a7a'"
                class="h-3 float-right mt-1.5 ml-1 brightness-[0.15]"
                src="@/assets/x.png"
                alt="x"
                title="Incorrect"
            >
        </label>
        <img
            v-if="questionData.image"
            :class="imageLoadFailed ? 'bg-neutral-200 dark:bg-neutral-800 rounded-2xl m-1 mt-3 aspect-square flex justify-center items-center p-8 w-[calc(100vw-64px)] max-w-72 overflow-auto' : 'max-h-96 rounded-2xl m-1 mt-3'"
            :src="questionData.image"
            :alt="questionData.altText"
            @error="imageLoadFailed = true"
        >
        
        <section class="flex flex-wrap justify-center">
            <button
                v-if="selectedAnswer == -1"
                class="m-2"
                :disabled="editingQuestion"
                :title="editingQuestion ? 'Finish editing the question first' : ''"
                :tabIndex="popupVisible ? -1 : ''"
                @click="$emit('delete')"
            >Delete</button>

            <button
                v-if="selectedAnswer == -1"
                @click="$emit('edit')"
                class="m-2"
                :disabled="editingQuestion"
                :title="editingQuestion ? 'Already editing this question' : ''"
                :tabIndex="popupVisible ? -1 : ''"
            >Edit</button>
            
            <button
                v-if="selectedAnswer == -1"
                class="m-2"
                :disabled="questionIndex == 0 || editingQuestion"
                :title="editingQuestion ? 'Finish editing the question first' : ''"
                :tabIndex="popupVisible ? -1 : ''"
                @click="$emit('move', -1)"
            >Move up</button>
            
            <button
                v-if="selectedAnswer == -1"
                class="m-2"
                :disabled="questionIndex == questionAmount - 1 || editingQuestion"
                :title="editingQuestion ? 'Finish editing the question first' : ''"
                :tabIndex="popupVisible ? -1 : ''"
                @click="$emit('move', 1)"
            >Move down</button>
        </section>
    </section>
</template>
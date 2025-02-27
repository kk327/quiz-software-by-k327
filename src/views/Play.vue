<script setup>
    import { useRoute, useRouter } from 'vue-router';
    import { ref, watch, computed } from 'vue';
    import Question from '../components/Question.vue';
    import Popup from '../components/Popup.vue';
    import helpers from '../helpers.js';

    const route = useRoute();
    const router = useRouter();

    let data, questions, singleQuestion;
    try {
        data = helpers.atob(route.params.data);
        questions = data.questions;
        singleQuestion = data.singleQuestion;
        document.title = data.name + " - Quiz Software by k327";
    } catch {
        data = '';
        questions = [];
    }

    if (singleQuestion) {
        questions = [questions[Math.floor(Math.random() * questions.length)]];
    }

    const answersShown = ref(false);
    const correctAnswers = ref(0);
    const answers = ref(Array(questions.length));
    const singleQuestionPopupVisible = ref(false);
    const timeLeft = ref(singleQuestion || !data.timeLimit ? 0 : data.timeLimit);

    let timerInterval;
    if (timeLeft.value) {
        timerInterval = setInterval(() => {
            timeLeft.value--;
            if (timeLeft.value == 0) {
                clearInterval(timerInterval);
                check();
            }
        }, 1000);
    }

    for (let index in questions) {
        if (questions[index].questionType == "multi") {
            answers.value[index] = Array(questions[index].answers.length).fill(false);
        }
    }

    watch(() => route.params.data, () => {
        router.go();
    });

    const finishedAnswering = computed(() => {
        return answers.value.filter((e, idx) => questions[idx].questionType == 'single' ? e >= 0 : true).length == answers.value.length;
    })

    function check() {
        correctAnswers.value = 0;
        for (let i = 0; i < questions.length; i++) {
            if (JSON.stringify(answers.value[i]) == JSON.stringify(questions[i].correct)) {
                correctAnswers.value++;
            }
        }
        
        answersShown.value = true;
        clearInterval(timerInterval);
        timeLeft.value = 0;
    }

    function changeMode() {
        let newData = data;
        if (singleQuestion) {
            delete newData.singleQuestion;
        } else {
            newData.singleQuestion = true;
        }
        router.push(helpers.btoa(newData));
    }
</script>

<template>
    <section
        v-if="!data"
        class="text-2xl px-2 w-screen h-screen flex justify-center items-center"
    >
        <h1>Load failed<br>Invalid quiz data</h1>
    </section>

    <header 
        v-if="data"
        class="flex items-center justify-center flex-wrap max-w-[calc(100vw-32px)]"
    >
        <section class="flex flex-col justify-center">
            <h1 
                class="font-bold text-2xl mx-2 only:mb-2 mt-2 only:mt-4"
                title="Quiz name"
            >{{ data.name }}</h1>

            <p 
                v-if="data.author"
                class="text-neutral-700 dark:text-neutral-400"
            >{{ "by " + data.author }}</p>
        </section>
        
        <button 
            v-if="!(!singleQuestion && questions.length == 1)"
            :tabIndex="singleQuestionPopupVisible ? -1 : ''"
            class="m-2 mt-4"
            @click="!singleQuestion && answers.some(e => e >= 0 || e.includes(true)) ? singleQuestionPopupVisible = true : changeMode()"
        >
            {{ singleQuestion ? "Disable single question mode" : "Enable single question mode" }}
        </button>
    </header>
    
    <p 
        v-if="answersShown"
        :class="data.author ? 'mt-2' : ''"
    >{{ questions.length == 1 ? 
            JSON.stringify(questions[0].correct) == JSON.stringify(answers[0]) ? 
                'Correct answer' 
                : 'Incorrect answer' 
            : `Correct answers: ${correctAnswers}/${answers.length} (${Math.round(100 / (questions.length / correctAnswers))}%)` }}
    </p>
    <p 
        v-if="timeLeft"
        :class="data.author ? 
                    'sticky top-0 w-full bg-white dark:bg-neutral-950 p-2 mb-[-8px] bg-opacity-90 dark:bg-opacity-90' 
                    : 'sticky top-0 w-full bg-white dark:bg-neutral-950 p-2 my-[-8px] bg-opacity-90 dark:bg-opacity-90'"
    >Time left: {{ timeLeft >= 60 ? Math.floor(timeLeft / 60) + "min " + timeLeft % 60 + "s" : timeLeft + "s" }}</p>
    
    <Question 
        v-for="data, index of questions"
        :questionData="data"
        :questionIndex="index"
        :answersShown="answersShown"
        :correctAnswersShown="false"
        :selectedAnswer="answers[index]"
        :popupVisible="singleQuestionPopupVisible"
        @selected="(i) => data.questionType == 'single' ? answers[index] = i : answers[index][i] = !answers[index][i]"
    />

    <button
        v-if="data"
        :disabled="!(finishedAnswering || (data.timeLimit > 0 && timeLeft == 0))"
        :title="finishedAnswering ? '' : 'Answer all questions first'"
        :tabIndex="singleQuestionPopupVisible ? -1 : ''"
        class="m-4"
        @click="answersShown ? router.go() : check()"
    >{{ answersShown ? 
            "Try again" 
            : questions.length == 1 ? 
                "Check the answer" 
                : "Check answers" }}
    </button>

    <Popup 
        v-if="singleQuestionPopupVisible"
        text="This will erase your progress.<br>Continue?"
        :buttons="['No', 'Yes']"
        @leave="singleQuestionPopupVisible = false"
        @buttonClicked="(index) => index == 0 ? singleQuestionPopupVisible = false : changeMode()"
    />
</template>
<script setup>
    import { ref, computed } from 'vue';
    import Question from '../components/Question.vue';
    import QuestionCreationPanel from '../components/QuestionCreationPanel.vue';
    import Popup from '../components/Popup.vue';
    import { useRoute, useRouter } from 'vue-router';
    import helpers from '../helpers.js';
    import config from "../config.json";

    const route = useRoute();
    const router = useRouter();

    const questions = ref([]);
    const name = ref("");
    const author = ref("");
    const category = ref("");
    const timeLimit = ref(0);
    const timeType = ref("seconds");

    const saveId = ref(-1);
    const saveCategory = ref("");
    const saveData = ref(JSON.stringify({ questions: [], name: "" }));

    const editedQuestion = ref(-1);
    const quizLink = ref("");
    const quitPopupVisible = ref(false);
    let adminMode = false;

    if (route.params.data) {
        const data = helpers.atob(route.params.data);
        adminMode = config.adminModeEnabled && data.adminMode == config.adminModeAccessName;

        if (data.questions) {
            name.value = data.name;

            if (data.category) {
                category.value = data.category;
                saveId.value = data.idInCategory;
                saveCategory.value = data.category;
            }

            if (data.author) {
                author.value = data.author;
            }

            if (!data.timeLimit) {
                timeType.value = "nolimit";
            } else if (data.timeLimit >= 60 && data.timeLimit % 60 == 0) {
                timeType.value = "minutes";
                timeLimit.value = data.timeLimit / 60;
            } else {
                timeLimit.value = data.timeLimit;
            }

            for (let questionData of data.questions) {
                questions.value.push(questionData);
            }

            if (adminMode) {
                saveData.value = JSON.stringify(generateQuizObject());
            }
        }
    }

    const unableToSaveText = computed(() => {
        return !name.value.trim() ? 'Name the quiz first' :
                    !category.value.trim() && adminMode ? 'Write the category first' :
                        questions.value.length == 0 ? 'Add at least one question first' : '';
    })

    function validateTimeLimit() {
        if (!timeLimit.value || timeLimit.value < 0) {
            timeLimit.value = 0;
        }
    }

    function generateQuizObject() {
        let thisQuizData = { questions: questions.value, name: name.value };
        
        if (!(timeType.value == "nolimit" || timeLimit.value == 0)) {
            thisQuizData.timeLimit = timeType.value == "seconds" ? 
                                        timeLimit.value 
                                        : timeLimit.value * 60;
        }

        if (author.value) {
            thisQuizData.author = author.value;
        }

        return thisQuizData;
    }

    function saveQuiz() {
        const thisQuizData = generateQuizObject();
        saveData.value = JSON.stringify(thisQuizData);

        let categories = [];
        if (localStorage.getItem("data")) {
            categories = JSON.parse(localStorage.getItem("data"));
            const categoryIndex = categories.findIndex(e => e.name == category.value);

            if (categoryIndex != -1) {
                if (saveId.value != -1 && category.value == saveCategory.value) {
                    categories[categoryIndex].data.splice(saveId.value + 1, 0, thisQuizData);
                } else {
                    categories[categoryIndex].data.push(thisQuizData);
                }
            } else {
                categories.push({ name: category.value, data: [thisQuizData] });
            }

            if (saveId.value != -1) {
                categories.find(e => e.name == saveCategory.value).data.splice(saveId.value, 1);
                if (categories.find(e => e.name == saveCategory.value).data.length == 0) {
                    categories.splice(categories.findIndex(e => e.name == saveCategory.value), 1);
                }
            }
        } else {
            categories.push({ name: category.value, data: [thisQuizData] });
        }

        localStorage.setItem("data", JSON.stringify(categories));
        saveCategory.value = category.value;
        saveId.value = categories.find(e => e.name == category.value).data.length - 1;
    }

    function addQuestion(question) {
        if (editedQuestion.value == -1) {
            questions.value.push(question);
        } else {
            questions.value[editedQuestion.value] = question;
            editedQuestion.value = -1;
        }
    }

    function generateQuizLink() {
        quizLink.value = location.origin + "/#/quiz/" + helpers.btoa(generateQuizObject());
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight }));
    }

    function copyLink() {
        navigator.clipboard.writeText(quizLink.value);
    }

    function saveAndQuit() {
        saveQuiz();
        router.push('/' + config.adminModeAccessName);
    }
</script>

<template>
    <header class="flex flex-col max-w-[calc(100vw-32px)] items-center">
        <h1 class="text-xl m-2 font-bold">Quiz settings:</h1>
        <label class="flex items-center justify-center w-full gap-1">
            Name:
            <input 
                type="text"
                v-model="name"
                class="my-1 mx-1 min-w-16"
                :tabindex="quitPopupVisible ? -1 : ''"
            >
        </label>

        <label class="flex items-center justify-center w-full gap-1 text-nowrap">
            Author (optional):
            <input 
                type="text"
                v-model="author"
                class="my-1 mx-1 min-w-16"
                :tabindex="quitPopupVisible ? -1 : ''"
            >
        </label>

        <label 
            v-if="adminMode"
            class="flex items-center justify-center w-full gap-1"
        >
            Category:
            <input 
                type="text"
                v-model="category"
                class="my-1 mx-1 min-w-16"
                :tabindex="quitPopupVisible ? -1 : ''"
            >
        </label>
        
        <label class="flex items-center justify-center w-full gap-1 text-nowrap">
            Time limit:
            <input 
                type="number"
                min="0"
                v-model="timeLimit"
                class="my-1 mx-1 min-w-16"
                :disabled="timeType == 'nolimit'"
                :tabindex="quitPopupVisible ? -1 : ''"
                @change="validateTimeLimit"
            >
        </label>

        <label class="cursor-pointer">
            <input 
                type="radio"
                value="seconds"
                name="timeType"
                v-model="timeType"
                checked
                class="cursor-pointer"
                :tabindex="quitPopupVisible ? -1 : ''"
            >
            Seconds
        </label>
        
        <label class="cursor-pointer">
            <input 
                type="radio"
                value="minutes"
                name="timeType"
                v-model="timeType"
                class="cursor-pointer"
                :tabindex="quitPopupVisible ? -1 : ''"
            >
            Minutes
        </label>
        
        <label class="cursor-pointer">
            <input 
                type="radio"
                value="nolimit"
                name="timeType"
                v-model="timeType"
                class="cursor-pointer"
                :tabindex="quitPopupVisible ? -1 : ''"
            >
            No limit
        </label>
    </header>

    <Question 
        v-for="data, index in questions"
        :questionData="data"
        :questionIndex="index"
        :answersShown="true"
        :correctAnswersShown="true"
        :selectedAnswer="-1"
        :questionAmount="questions.length"
        :editingQuestion="editedQuestion == index"
        :popupVisible="quitPopupVisible"
        @delete="questions.splice(index, 1)"
        @move="(value) => questions[index] = questions.splice(index + value, 1, questions[index])[0]"
        @edit="editedQuestion = index"
    />
        
    <QuestionCreationPanel
        :editedQuestionData="editedQuestion != -1 ? JSON.parse(JSON.stringify(questions[editedQuestion])) : null"
        :questions="questions.map(e => e.question)"
        :popupVisible="quitPopupVisible"
        @addQuestion="(question) => addQuestion(question)"
    />

    <section class="flex flex-row">
        <button
            @click="adminMode ? saveQuiz() : generateQuizLink()"
            class="my-4 mx-2"
            :disabled="unableToSaveText != ''"
            :title="unableToSaveText"
            :tabindex="quitPopupVisible ? -1 : ''"
        >{{ adminMode ? "Save quiz" : "Get quiz link" }}</button>

        <button 
            v-if="adminMode"
            class="my-4 mx-2"
            :tabindex="quitPopupVisible ? -1 : ''"
            @click="saveData == JSON.stringify(generateQuizObject()) && saveCategory == category ? router.push('/' + config.adminModeAccessName) : quitPopupVisible = true"
        >Main menu</button>
    </section>

    <section 
        v-if="quizLink"
        class="flex items-center my-2"
    >
        <h1 class="text-xl mr-1 font-bold">Quiz link:</h1>
        <button
            class="ml-1"
            @click="copyLink"
        >Copy</button>
    </section>

    <p
        v-if="quizLink" 
        class="select-all mb-4 w-[calc(100vw-32px)] max-w-[800px] break-words"
    >{{ quizLink }}</p>

    <Popup 
        v-if="quitPopupVisible"
        text="Save this quit before quitting?"
        :buttons="['Save & quit', 'Cancel', 'Quit']"
        :buttonDisabledInfo="unableToSaveText"
        @leave="quitPopupVisible = false"
        @buttonClicked="(index) => index == 0 ? 
                            saveAndQuit() 
                            : index == 1 ?
                                quitPopupVisible = false
                                : router.push('/' + config.adminModeAccessName)"
    />
</template>
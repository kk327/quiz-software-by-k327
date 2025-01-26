<script setup>
    import { ref, onMounted, computed } from 'vue';
    import QuizTile from '../components/QuizTile.vue';
    import Popup from '../components/Popup.vue';
    import { useRoute, useRouter } from 'vue-router';
    import config from "../config.json";
    import helpers from '../helpers.js';

    const route = useRoute();
    const router = useRouter();

    const categories = ref([]);
    const loadingStatus = ref("Loading quizzes...");
    const adminMode = config.adminModeEnabled && route.params.adminMode == config.adminModeAccessName;

    const exportedJSON = ref("");
    const dataJSON = ref("");
    const deletedQuizData = ref([]);
    const fromLinkPopupVisible = ref(false);
    const syncPopupVisible = ref(false);

    document.title = "Quiz Software by k327";

    onMounted(async () => {
        async function loadDataJson() {
            try {
                dataJSON.value = JSON.stringify(await(await fetch(location.origin + "/data.json")).json());
            } catch {
                dataJSON.value = false;
            }
        }

        try {
            if (adminMode) {
                await loadDataJson();
                if (!localStorage.getItem("data") && dataJSON.value) {
                    if (dataJSON.value) {
                        sync(false);
                    } else {
                        throw new Exception();
                    }
                }
                categories.value = JSON.parse(localStorage.getItem("data"));
            } else {
                categories.value = await(await fetch(location.origin + "/data.json")).json();
            }
        } catch {
            loadingStatus.value = "An error occured while loading quizzes.";
            return;
        }
        loadingStatus.value = "";
    })

    const tabIndex = computed(() => {
        return exportedJSON.value || fromLinkPopupVisible.value || syncPopupVisible.value || deletedQuizData.value.length != 0 ? -1 : '';
    })
    
    function deleteQuiz(idx, category) {
        if (categories.value.find(e => e.name == category).data.length == 1) {
            categories.value = categories.value.filter(e => e.name != category);
        } else {
            categories.value.find(e => e.name == category).data = categories.value.find(e => e.name == category).data.filter((e, i) => i != idx);
        }
        localStorage.setItem("data", JSON.stringify(categories.value));
        deletedQuizData.value = [];
    }

    function moveCategory(index, value) {
        categories.value[index] = categories.value.splice(index + value, 1, categories.value[index])[0];
        localStorage.setItem("data", JSON.stringify(categories.value));
    }

    function moveQuiz(categoryData, index, value) {
        categoryData[index] = categoryData.splice(index + value, 1, categoryData[index])[0];
        localStorage.setItem("data", JSON.stringify(categories.value));
    }

    function addQuiz([link, category]) {
        if (categories.value.filter(e => e.name == category).length != 0) {
            categories.value.filter(e => e.name == category)[0].data.push(helpers.atob(link.substring(link.indexOf("/#/quiz/") + 8)));
        } else {
            categories.value.push({ name: category, data: [helpers.atob(link.substring(link.indexOf("/#/quiz/") + 8))] });
        }

        localStorage.setItem("data", JSON.stringify(categories.value));
        fromLinkPopupVisible.value = false;
    }

    function sync(reload) {
        localStorage.setItem("data", dataJSON.value);

        if (reload) {
            router.go();
        }
    }

    function exportJson() {
        exportedJSON.value = localStorage.getItem("data");
    }

    function copyJSON() {
        navigator.clipboard.writeText(exportedJSON.value);
    }
</script>

<template>
    <header :class="loadingStatus || categories.length == 0 ? 'w-screen h-screen flex justify-center items-center flex-col' : ''">
        <section>
            <RouterLink 
                v-if="!(adminMode && loadingStatus)"
                :to="'create/' + (adminMode ? helpers.btoa({ adminMode: config.adminModeAccessName }) : '')"
                :tabindex="tabIndex"
            >
                <button 
                    class="mx-2 my-4 h-fit"
                    :tabindex="tabIndex"
                >Create new quiz</button>
            </RouterLink>

            <button
                v-if="!(adminMode && loadingStatus)"
                class="mx-2 my-4"
                :tabindex="tabIndex"
                @click="fromLinkPopupVisible = true"
            >
                {{ adminMode ? 'Add quiz from link' : 'Edit quiz from link' }}
            </button>

            <button 
                v-if="adminMode"
                class="mx-2 my-4"
                :tabindex="tabIndex"
                @click="exportJson"
            >Export full JSON</button>

            <button
                v-if="adminMode"
                class="mx-2 my-4"
                :tabindex="tabIndex"
                :disabled="!dataJSON || JSON.stringify(categories) == dataJSON"
                :title="!dataJSON ? 
                            'The data.json downloaded on page load is invalid.'
                            : JSON.stringify(categories) == dataJSON ?
                                'The data is already synced. If it isn\'t and the data.json has been changed since page load, refresh the page.'
                                : ''"
                @click="syncPopupVisible = true"
            >Sync with data.json</button>
        </section>
        <h1 v-if="loadingStatus">{{ loadingStatus }}</h1>
    </header>

    <details 
        v-for="categoryData, idx in categories"
        class="group last:mb-4"
        open
    >
        <button
            v-if="adminMode"
            class="m-2"
            :disabled="idx == 0"
            :tabindex="tabIndex"
            @click="moveCategory(idx, -1)"
        >Move up</button>
        <button
            v-if="adminMode"
            class="m-2"
            :disabled="idx == categories.length - 1"
            :tabindex="tabIndex"
            @click="moveCategory(idx, 1)"
        >Move down</button>

        <summary 
            class="cursor-pointer text-2xl font-bold mt-2 px-4 w-fit mx-auto text-neutral-400 dark:text-neutral-500 group-open:text-neutral-900 group-open:dark:text-neutral-200"
            :tabindex="tabIndex"
        >{{ categoryData.name }}</summary>

        <section class="flex flex-wrap justify-center max-w-[1056px] mx-auto">
            <QuizTile
                v-for="data, idx in categoryData.data"
                :quizData="data"
                :categoryData="categoryData"
                :idInCategory="idx"
                :adminMode="adminMode"
                :tabIndex="tabIndex"
                @delete="deletedQuizData = [idx, categoryData.name]"
                @move="(value) => moveQuiz(categoryData.data, idx, value)"
            />
        </section>
    </details>

    <Popup 
        v-if="exportedJSON"
        :text="exportedJSON"
        :buttons="['Copy', 'Ok']"
        :selectAll="true"
        @leave="exportedJSON = ''"
        @buttonClicked="(index) => index == 0 ? copyJSON() : exportedJSON = ''"
    />

    <Popup
        v-if="fromLinkPopupVisible"
        :text="adminMode ? 'Add quiz from link' : 'Edit quiz from link'"
        :buttons="['Cancel', 'Done']"
        :inputs="adminMode ? ['Link', 'Category'] : ['Link']"
        @leave="fromLinkPopupVisible = false"
        @buttonClicked="(index, inputValues) => index == 0 ? 
                            fromLinkPopupVisible = false 
                            : adminMode ? 
                                addQuiz(inputValues) 
                                : router.push('create/' + inputValues[0].substring(inputValues[0].indexOf('/#/quiz/') + 8))"
    />

    <Popup 
        v-if="syncPopupVisible"
        text="This will override your localStorage data with the one from data.json.<br>The data from data.json used in this was downloaded on page load, if it has changed since refresh the page before proceeding.<br>Continue?"
        :buttons="['No', 'Yes']"
        @leave="syncPopupVisible = false"
        @buttonClicked="(index) => index == 0 ? syncPopupVisible = false : sync(true)"
    />

    <Popup
        v-if="deletedQuizData.length != 0"
        :text="'Are you sure you want to delete the quiz ' + categories.find(e => e.name == deletedQuizData[1]).data[deletedQuizData[0]].name + '?'"
        :buttons="['No', 'Yes']"
        @leave="deletedQuizData = []"
        @buttonClicked="(index) => index == 0 ? deletedQuizData = [] : deleteQuiz(deletedQuizData[0], deletedQuizData[1])"
    />
</template>
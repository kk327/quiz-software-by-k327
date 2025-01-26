<script setup>
    import helpers from '../helpers.js';
    import config from "../config.json";
    
    const props = defineProps([
        "quizData",
        "categoryData",
        "idInCategory",
        "adminMode",
        "tabIndex"
    ]);
</script>

<template>
    <section class="w-[calc(100vw-32px)] max-w-80 bg-neutral-125 dark:bg-neutral-900 m-4 p-3 rounded-2xl flex flex-col items-center h-fit">
        <h1 :class="quizData.author ? 'text-xl font-bold w-full overflow-x-auto' : 'text-xl font-bold mb-3 w-full break-words'">
            {{ quizData.name }}
        </h1>
        <p 
            v-if="quizData.author"
            class="mb-2 text-neutral-700 dark:text-neutral-400 w-full break-words"  
        >{{ "by " + quizData.author }}</p>

        <section class="w-full">
            <RouterLink 
                :to="'quiz/' + helpers.btoa(quizData)"
                :tabindex="tabIndex"
            >
                <button 
                    :class="adminMode ? 'm-2' : 'w-[calc(100%-16px)] my-2'"
                    :tabindex="tabIndex"
                >Play</button>
            </RouterLink>

            <RouterLink 
                v-if="adminMode"
                :to="'create/' + helpers.btoa({...quizData, category: categoryData.name, idInCategory: idInCategory, adminMode: config.adminModeAccessName })"
                :tabindex="tabIndex"
            >
                <button 
                    class="m-2"
                    :tabindex="tabIndex"
                >Edit</button>
            </RouterLink>

            <button 
                v-if="adminMode"
                class="m-2"
                :tabindex="tabIndex"
                @click="$emit('delete')"
            >Delete</button>

            <button 
                v-if="adminMode"
                class="m-2"
                :disabled="idInCategory == 0"
                :tabindex="tabIndex"
                @click="$emit('move', -1)"
            >Move back</button>

            <button 
                v-if="adminMode"
                class="m-2"
                :disabled="idInCategory == categoryData.data.length - 1"
                :tabindex="tabIndex"
                @click="$emit('move', 1)"
            >Move forth</button>
        </section>

        <p class="text-neutral-500 dark:text-neutral-450">
            {{ quizData.questions.length }} question{{ quizData.questions.length == 1 ? '' : 's' }}
        </p>
    </section>
</template>
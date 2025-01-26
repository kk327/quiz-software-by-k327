<script setup>    
    import { ref, onUnmounted } from 'vue';
    import helpers from '../helpers.js';

    const props = defineProps([
        "text",
        "inputs",
        "buttons",
        "selectAll",
        "buttonDisabledInfo"
    ]);

    const emit = defineEmits([
        "leave"
    ]);

    const inputValues = ref(props.inputs ? Array(props.inputs.length).fill("") : []);

    function keyPressListener(e) {
        if (e.key == "Escape") {
            emit("leave");
        }
    }

    function testLinkValidity() {
        try {
            helpers.atob(inputValues.value[0].substring(inputValues.value[0].indexOf('/#/quiz/') + 8));
        } catch {
            return false;
        }
        return true;
    }

    addEventListener("keydown", keyPressListener);
    document.querySelector("body").style.overflow = "hidden";

    onUnmounted(() => {
        removeEventListener("keydown", keyPressListener);
        document.querySelector("body").style.overflow = "auto";
    })
</script>

<template>
    <section class="w-screen h-screen flex justify-center items-center fixed bg-opacity-70 dark:bg-opacity-70 bg-white dark:bg-neutral-950">
        <section class="w-[calc(100vw-32px)] max-w-80 max-h-96 bg-neutral-125 dark:bg-neutral-900 p-3 rounded-2xl">
            <h1 
                :class="selectAll ? 'font-bold mb-2 break-words max-h-72 overflow-y-auto select-all' : 'font-bold mb-2 break-words max-h-72 overflow-y-auto'"
                v-html="text"
            ></h1>

            <label v-for="inputText, idx in inputs">
                {{ inputText + ":" }}
                <input 
                    type="text"
                    class="my-1 mx-1 w-48"
                    v-model="inputValues[idx]"
                >
            </label>

            <button 
                v-for="buttonText, idx in buttons"
                class="m-2 mb-0 px-8"
                :disabled="(buttonText == 'Done' && (inputValues.some(e => !e) || !testLinkValidity())) || (buttonText == 'Save & quit' && buttonDisabledInfo != '')"
                :title="buttonText == 'Done' ? 
                            inputValues.some(e => !e) ?
                                (inputValues.length == 1 ? 
                                    'Fill in the input first'
                                    : 'Fill in the inputs first')
                                : (testLinkValidity() ?
                                    '' 
                                    : 'The link is invalid')
                            : buttonText == 'Save & quit' && buttonDisabledInfo ?
                                buttonDisabledInfo
                                : ''"
                @click="$emit('buttonClicked', idx, inputValues)"
            >{{ buttonText }}</button>
        </section>
    </section>
</template>
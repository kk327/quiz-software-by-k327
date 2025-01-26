export default {
    atob(string) {
        let object;
        let finishedObject;

        try {
            object = JSON.parse(window.atob(string.replaceAll("_", "/")));
        } catch {
            object = JSON.parse(new TextDecoder().decode(Uint8Array.from(string.split(","))));
        }

        if ("m" in object && !("q" in object)) {
            finishedObject = { adminMode: object.m };
        } else {
            let questions = object.q.map(q => {
                return { question: q.q, 
                         answers: q.a, 
                         correct: q.t == 0 ? q.c : q.c.map(e => e == 1 ? true : false), 
                         questionType: q.t == 0 ? "single" : "multi", 
                         image: q.i, 
                         altText: q.l }
            });
    
            finishedObject = { questions: questions, 
                               name: object.n,
                               timeLimit: object.t,
                               singleQuestion: object.s,
                               author: object.a,
                               adminMode: object.m,
                               category: object.c,
                               idInCategory: object.i };
        }
        return finishedObject;
    },

    btoa(object) {
        let finishedObject;

        if ("adminMode" in object && !("questions" in object)) {
            finishedObject = { m: object.adminMode };
        } else {
            let questions = object.questions.map(q => { 
                return { q: q.question, 
                         a: q.answers, 
                         c: q.questionType == "single" ? q.correct : q.correct.map(e => e ? 1 : 0), 
                         t: q.questionType == "multi" ? 1 : 0,
                         i: q.image, 
                         l: q.altText }
            });
    
            finishedObject = { q: questions, 
                               n: object.name, 
                               t: object.timeLimit, 
                               s: object.singleQuestion, 
                               a: object.author, 
                               m: object.adminMode,
                               c: object.category,
                               i: object.idInCategory };
        }
        
        try {
            return window.btoa(JSON.stringify(finishedObject)).replaceAll("/", "_");
        } catch {
            return new TextEncoder().encode(JSON.stringify(finishedObject)).toString();
        }
    }
}
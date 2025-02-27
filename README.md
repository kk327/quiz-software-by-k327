# Overview
Quiz Software by k327 is a webapp for creating quizzes whose data is stored encoded in a link.  
It allows for adding an image to each question, making both single and multi answer questions, setting a time limit for the quiz and also features a single question mode, dark and light themes, and more.  
You can host it and have your own website with it and a list of quizzes on the homepage. You can manage the quiz list using a client-side admin mode which later gives you a JSON file to put on the server.  
Made using Vue.js and TailwindCSS.

# Basic usage
### General
There are site-wide themes, dark and light. The theme adapts to your system preferences.  
You can view a site with this webapp hosted on it [here](https://quiz.k327.eu). It uses the default admin mode access name, adminMode.

### Homescreen
On the homepage there are two button which allow you to create a new quiz and to edit an existing one from a link, and a list of quizzes grouped by categories if any are added to the data.json file.  
You can collapse category names, and to play a quiz from the homepage simply press the play button.  
When you press the edit quiz from link button you will be prompted to input a quiz link, you can input either a link to your own quiz that you got when you clicked get quiz link on the quiz creation page, or a link to a quiz made by someone else.  
Create new quiz sends you directly to a page in which you can create a new quiz.

### Quiz creation
On the quiz creation page you can set quiz settings, add or edit questions, and when you're done get the quiz link.  
Regarding the settings, name and author are displayed either on the homepage in the quiz list or at the top of the screen when you play the quiz, the time limit is how much time one has to finish the entire quiz, if you leave it at 0 seconds it will be infinite, but there's also a no limit option specifically designed for that.  
In question creation, the question type determines whether the person playing the quiz will be able to choose one answer or a different amount of them, and also how many answers you will set as correct. Then there's the question input, and the list of answers that you can add in the input below.  
You can also add an image by including a link to it, it's done this way because it's not possible to store an entire image in the link. You also have to add an alt text to the image. When you're done, click add question.  
On the question list you will have three buttons at the bottom of each question, delete, edit, move up and move down. Delete deletes the question, edit lets you edit it in the question creation panel, and the move buttons move it above or below other questions.  
When you're done creating your quiz, press get quiz link, copy it and now you and others can go to it and play your quiz.

### Playing
When you play a quiz, then at the top of the page there's the quiz and optionally the author.  
Next to it is a button to enable single question mode if the quiz has more than one question. When you enable it you'll get a random question from the quiz to answer, you can then draw a random question from the quiz again. If you've already answered some questions you will get a popup first saying that it will erase your progress and asking whether to continue or not. 
Below is the amount of time left if it is not infinite. When it runs out the quiz checks your answers regardless of whether you've answered all questions or not. The amount of time left sticks to the top of your screen when you scroll down.
Under it there are the questions, to answer them simply click on the answers. If the checkboxes are circular, the question only allows one answer, if they're rectangular, the question allows multiple answers, but then it's also possible for it to contain zero correct answers.  
At the bottom of the page there's a button to check whether your answer or answers are correct. When you click it, the correct and wrong answers will be highlighted. If the question is single choice, the correct answer will be highlighted in green and with a V symbol, and if it wasn't your answer, your answer will be highlighted in red with an X symbol.  
If the question is multi choice, if you mark a wrong answer as correct, it will be in red, and if you don't mark it, it won't be highlighted. If you mark a correct answer as correct it'll be in green, and if you don't mark it, it'll be in red.  
The second thing that will happen then, is a text at almost the top of the page will appear saying how many of the answers are correct and the percentage of correct answers if there were multiple questions, or if the answer was correct or not if there was just one question.  
The check answers button turns into a try again button after checking the answers, click it to play the quiz again, or in case of single answer mode, draw another question. Note that the question doesn't necessarily have to be different from the one you've already drawed, so it's possible for them to repeat.

# Admin mode
### General
Admin mode allows you to easily edit the list of quizzes visible on the homescreen.  
If you don't want it, you can disable it in src/config.json, as well as change its access name there.  
To access admin mode, add the access name to the link and refresh the page. So for example if the website is hosted at quiz.k327.eu and the access name is adminMode, the link will be quiz.k327.eu/#/adminMode.  
The mode is client-side, which means that you, or anyone who gets to know the access name, can't make changes to the quiz list visible with it disabled just using the admin mode.  
If you want to publish changes made in admin mode to the normal version, get the json file using the export full json button and put it in data.json. It's located in public/data.json in the source files, and /data.json when the app is built.  
Data.json is used for the quiz list on the non-admin mode version of the website, the admin mode version stores it in localStorage locally on your device. The localStorage data is synced with data.json on first load, you can also sync it later on using the sync with data.json button.

### Homescreen
The homescreen has the most changes. First, there are more buttons at the top of the page and the edit quiz from link button is replaced with add quiz from link. When you press it, in addition to the link it asks you for the category to which you want to add the quiz. When you press done, the quiz will be added to the homescreen to the specified category. If the category didn't exist before, it will be created.  
The first new button is export full json, which gives you the json data that you can put in data.json to publish the quiz list to the non-admin mode version of the website.  
The second one is sync with data.json, which replaces the localStorage data with the one from data.json, meaning that it replaces the contents of the admin mode quiz list with the contents of it without admin mode. The data used for that is downloaded from data.json on page load, so if it has changed since then refresh the page before syncing. This gives you a popup warning about both of those aspects and asking if you want to proceed.  
Then there are the new buttons for each category. They allow you to move a category below or above another one.  
And lastly, the many new buttons on the quiz tiles. Edit takes you to a quiz creation page with the quiz loaded in it, when you save it, it'll be saved in the place of the old version of it. This also applies if you change the category of it or its name, if that's the case, it will change it's name and move it to the newly specified category.  
The next button is delete, it deletes the quiz. It also deletes the category if that quiz was the only one in it. But before that it gives you a popup asking if you're sure that you want to delete the quiz.  
The last two buttons are move back and move forth, which work almost exactly the same as they do with categories, except this time the quiz isn't always moving below or above, but rather in order of the quizzes. Up to three of them can fit in a row, so in that case they will move left and right, and when they reach the end of the row, up or down.

### Quiz creation
The first change on the quiz creation page is that there's one more input in the settings, the category input. It determines which category the quiz will be added to when you save it.  
The second change is that now instead of a get quiz link button there's a save quiz button, which instead of giving you a link, saves the quiz onto the quiz list on the homepage.  
Lastly, the main menu button. It brings you back to the main menu. If you've made any changes it gives you a popup asking whether to save before quitting or not.
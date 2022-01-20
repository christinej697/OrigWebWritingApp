/* UI Controller ***************************/
var UIController = (function() {
    
    //strings used to access the DOM
    var DOMstrings = {
        submitBtn: '.submit-btn',
        firstName: '.first-name-input',
        lastName: '.last-name-input',
        idInput: '.id-input',
        login: '.login',
        problemPage1: '.problem-page1',
        probBtn1: 'prob-btn-1',
        ques1input: 'ques-1-input',
        ques2input: 'ques-2-input',
        ques3input: 'ques-3-input',
        ques4input: 'ques-4-input',
        problemPage2: '.problem-page2',
        probBtn2: 'prob-btn-2',
        problemPage3: '.problem-page3',
        problemPage4: '.problem-page4',
        answerInput: 'answer-input',
        popup: '.popup',
        finalBtn: 'final-btn',
        VsSummary: 'Vs-summary',
        R1Summary: 'R1-summary',
        R2Summary: 'R2-summary',
        R3Summary: 'R3-summary',
        mostInput: 'most-input',
        leastInput: 'least-input',
        lastBtn: 'last-btn',
        response: '.response',
        probDisplay4: '.display-4'
    };
    
    return {
        getDOMstrings: function() {
            return DOMstrings;
        }
    }
    
})();

/* GLOBAL Controller *************************/

var controller = (function(UICtrl) {
    
    //get DOM strings so we can use them
    var DOMstr = UICtrl.getDOMstrings();
    
    //set variables for duration timers
    var elapsed = 0.0;
    
    var globalCurrentTime;
    var globalPreviousTime = new Date().getTime();
    var globalTime;
    
    var emailSent = 0;  //initially sent to 0 to indicate email has not been sent
    var finishedEmailFlag = 0;      //set to 0 to indicate student has not completed problem
    
    //user object that will be used to store user information
    var user = {
        globalPath: [],
        globalDuration: [],
        numPopups: 0
    }
    
    //setup all event listeners in the program
    var setupEventListeners = function() {
            
        console.log('in login page - event listeners set up');
        document.querySelector(DOMstr.submitBtn).addEventListener('click', function(event) {
            createUser();           //create new user
        });   
        
        document.getElementById(DOMstr.probBtn1).addEventListener('click', function(event) {
            submitAnswer();
        });
        
        document.getElementById(DOMstr.probBtn2).addEventListener('click', function(event) {
            submitAnswerText();
        });
        
        //equation buttons
        var buttonIds = ['eqn', 'equals', 'multiplied', 'divided', 'squared', 'greater', 'less', 'voltage', 'current', 'power'];
        for(var i = 0; i < buttonIds.length; i++) {
            document.getElementById(buttonIds[i]).addEventListener('click', function(event) {
                equationAddWord(event);
                event.preventDefault();
            });
        };
        
        document.getElementById(DOMstr.finalBtn).addEventListener('click', function(event) {
            submitAnswer();
        });
        
        document.getElementById(DOMstr.lastBtn).addEventListener('click', function(event) {
            submitAnswer();
            finishedEmailFlag = 1;
        })
        
        //if user exits early, send email
        window.addEventListener('beforeunload', function(event) {
            if(emailSent == 0) {        //only send email if it hasnt already been sent
                if(finishedEmailFlag) {
                    user.globalPath.push('Finished');
                    sendEmail();
                }
                else {
                    user.globalPath.push('Exited early');
                    sendEmail();
                }
            } else {
                //do nothing
            }
        });
        
       
    };
    
    //keypress event listener for the popup
    var setupKeypressEventListener = function() {
        var time = 30000;   //30 seconds
            
        var popupTimer = setTimeout(popup, time);

         document.addEventListener('keypress', function(event) {
            //clear timeout
             clearTimeout(popupTimer);
             //reset timer
             popupTimer = setTimeout(popup, time);
             //change visibility of popup back to 0
             document.querySelector(DOMstr.popup).style.visibility = 'hidden';
             document.querySelector(DOMstr.popup).style.opacity = '0';
             
        });
        //equation buttons
        var buttonIds = ['eqn', 'equals', 'multiplied', 'divided', 'squared', 'greater', 'less', 'voltage', 'current', 'power'];
        for(var i = 0; i < buttonIds.length; i++) {
            document.getElementById(buttonIds[i]).addEventListener('click', function(event) {
                //clear timeout
                 clearTimeout(popupTimer);
                 //reset timer
                 popupTimer = setTimeout(popup, time);
                 //change visibility of popup back to 0
                 document.querySelector(DOMstr.popup).style.visibility = 'hidden';
                 document.querySelector(DOMstr.popup).style.opacity = '0';
                event.preventDefault();
            });
        };
    }
    
    var createUser = function() {
        
        var timeStamp = new Date().toLocaleString();
        user.timeStamp = timeStamp;         //put time stamp in user
        user.globalPath.push('Login');
        user.globalDuration.push(0);          //could change this? maybe don't set a duration for start? will always be 0
        
        //put names in user
    /*    var firstName = document.querySelector(DOMstr.firstName).value;
        var lastName = document.querySelector(DOMstr.lastName).value;
        console.log(firstName);
        if(firstName == '' || firstName == null)  {
            user.firstName = 'Unknown';
        } else {
            user.firstName = firstName;
        }
        if(lastName == '' || lastName == null ) {
            user.lastName = 'Unknown';
        } else {
            user.lastName = lastName;
        }
        */
        
        //get student id of user
        var studentID = document.querySelector(DOMstr.idInput).value;
        if(studentID == '' || studentID == null) {
            //if student does not enter anything
            alert('Please enter your student ID number.');
        } else if(studentID.length != 8) {
            //if id is not of proper length
            alert('Please enter an 8-digit ID number.');
        } else {
            user.studentID = studentID;
            changePage();       //change page after student id number has been verified
        }
        
        //pull users ip address and save in user        
        var request = new XMLHttpRequest();
        request.open('GET', 'https://api.ipify.org', true);         
        request.send();
        request.onload = function() {
            user.ip = this.response;
        }
        
    };
    
    var submitAnswer = function() {
        
        //the page that is active will determine what answers we are checking
        if(document.querySelector(DOMstr.problemPage1).classList.contains('active')) {
            //get user answers
            var ques1input = document.getElementById(DOMstr.ques1input).value;
            var ques2input = document.getElementById(DOMstr.ques2input).value;

            //check if are numbers between 0 and 100
            if(isNaN(ques1input) || isNaN(ques2input)) {
                alert("Please make sure all answers are numbers.");
            } else if(ques1input > 100 || ques1input < 0 || ques2input > 100 || ques2input < 0) {
                alert("Please enter an appropriate percentage value.");
            } else if(ques1input == '' || ques1input == null || ques2input == '' || ques2input == null) {
                //user did not input anytying
                alert('Please enter a value for each question.');
            }
            else {
                //save user answers to user object
                user.understandingBeforePerc = ques1input + '%';
                user.abilityBeforePerc = ques2input + '%';
                changePage();
            }
        } else if(document.querySelector(DOMstr.problemPage3).classList.contains('active')) {
            //get user answers
            var ques3input = document.getElementById(DOMstr.ques3input).value;
            var ques4input = document.getElementById(DOMstr.ques4input).value;

            //check if are numbers between 0 and 100
            if(isNaN(ques3input) || isNaN(ques4input)) {
                alert("Please make sure all answers are numbers.");
            }
            else if(ques3input > 100 || ques3input < 0 || ques4input > 100 || ques4input < 0) {
                alert("Please enter an appropriate percentage value.");
            } else if(ques3input == '' || ques3input == null || ques4input == '' || ques4input == null) {
                alert('Please enter a value for each question.');
            }
            else {
                //save user answers to user object
                user.understandingAfterPerc = ques3input + '%';
                user.abilityAfterPerc = ques4input + '%';
                user.globalPath.push('Finished');
                changePage();
            }
        } else if(document.querySelector(DOMstr.problemPage4).classList.contains('active')) {
            var leastConfidentResponse = document.getElementById(DOMstr.leastInput).value;
            var mostConfidentResponse = document.getElementById(DOMstr.mostInput).value;
            if(leastConfidentResponse == '' || leastConfidentResponse == null || mostConfidentResponse == '' || mostConfidentResponse == null) {
                alert('Please enter a response to each question.');
            } else {
                user.leastConfidentResponse = leastConfidentResponse;
                user.mostConfidentResponse = mostConfidentResponse;
                endPage();      //send email and edit page to look nice when student is complete
                sendEmail();
            }
                
        }
    }
    
    
    var changePage = function() {
        if(document.querySelector(DOMstr.login).classList.contains('active')) {
            //change to page 1
            document.querySelector(DOMstr.login).classList.remove('active');
            document.querySelector(DOMstr.problemPage1).classList.add('active');
        } else if(document.querySelector(DOMstr.problemPage1).classList.contains('active')) {
            //change to page 2
            document.querySelector(DOMstr.problemPage1).classList.remove('active');
            document.querySelector(DOMstr.problemPage2).classList.add('active');
            setupKeypressEventListener();       //start timer for keypress popup feature
        } else if(document.querySelector(DOMstr.problemPage2).classList.contains('active')) {
            //change to page 3
            document.querySelector(DOMstr.problemPage2).classList.remove('active');
            document.querySelector(DOMstr.problemPage3).classList.add('active');
        } else if(document.querySelector(DOMstr.problemPage3).classList.contains('active')) {
            //change to page 4
            document.querySelector(DOMstr.problemPage3).classList.remove('active');
            document.querySelector(DOMstr.problemPage4).classList.add('active');
            //edit main reponse paragraph in page 4 to show users reponse from previous problem
            document.querySelector(DOMstr.response).textContent = '"' + user.mainResponse + '"';
        }
    }
    
    var submitAnswerText = function() {
        //answer to user object
        var mainResponse = document.getElementById(DOMstr.answerInput).value;
        //answer to drop downs
        var VsSummary = document.getElementById(DOMstr.VsSummary).value;
        var R1Summary = document.getElementById(DOMstr.R1Summary).value;
        var R2Summary = document.getElementById(DOMstr.R2Summary).value;
        var R3Summary = document.getElementById(DOMstr.R3Summary).value;
        if(mainResponse == '' || mainResponse == null) {
            alert('Please enter a response to the question.');
        } else if(VsSummary == 'select' || R1Summary == 'select' || R2Summary == 'select' || R3Summary == 'select') {
            alert('Please answer all questions.');    
        } else {
            user.mainResponse = mainResponse;
            user.VsSummary = VsSummary;
            user.R1Summary = R1Summary;
            user.R2Summary = R2Summary;
            user.R3Summary = R3Summary;
            changePage();
        }
    };
    
    var equationAddWord = function(buttonEl) {
        var button  = buttonEl.target;
        var word = button.textContent;     //get word that user clicked on
        
        var textarea = document.getElementById(DOMstr.answerInput);     //select textarea to put words in
        
        //IE support
        if (document.selection) {
            textarea.focus();
            sel = document.selection.createRange();
            sel.text = word;
        }
        //MOZILLA and others
        else if (textarea.selectionStart || textarea.selectionStart == '0') {
            var startPos = textarea.selectionStart;     //get start and end position
            var endPos = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, startPos)      //put in word at designated position
                + word
                + textarea.value.substring(endPos, textarea.value.length);
            textarea.selectionStart = startPos + word.length;       //set start and end positions to end of the word
            textarea.selectionEnd = startPos + word.length;
            textarea.focus();           //refocus on textarea so Chrome won't lose cursor position
        } else {
            textarea.value += word;
        }
    };
    
    var popup = function() {
        document.querySelector(DOMstr.popup).style.visibility = 'visible';
        document.querySelector(DOMstr.popup).style.opacity = '1';
        user.numPopups = user.numPopups + 1;
    }
    
    var sendEmail = function() {
        //update final duration for whole problem in user
        globalCurrentTime = new Date().getTime();
        globalTime = globalCurrentTime - globalPreviousTime;
        elapsed = globalTime/1000;
        user.globalDuration.push(elapsed);
        
        var emailText = JSON.stringify(user);
        var refinedEmailText = emailText.replace(/\\/g, '');
        refinedEmailText = refinedEmailText.replace(/\"/g, ' ');
        
        var message = 'Writing Problem Submission: \n' + refinedEmailText;
        console.log(message);
        
        var templateParams = {
           "message_html": message
        };
        
        emailSent = 1;

        //COMMENT OUT
        emailjs.send('gmail', 'template_YdBS2dc3', templateParams)
            .then(function(response) {
               console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
               console.log('FAILED...', error);
            })
            delay(1000);     
      //END COMMENT HERE
    
        console.log('email sent');
    }
    
    var delay = function(amt) {
        var start = new Date().getTime();
        while(new Date().getTime() < start + amt);
    };
    
    var endPage = function() {
        document.querySelector(DOMstr.probDisplay4).innerHTML = '<p><em><b>Thank you!</b></em></p>';
     //   document.getElementById(DOMstr.lastBtn).style.display = 'none';
     //   document.getElementById(DOMstr.lastBtn).insertAdjacentHTML('afterend', '<p><em><b>Thank you!</b></em></p>');
    }
    
    return {
        initialize: function() {
            console.log('Application started!');
            setupEventListeners();  
                    
        }  
    }
    
})(UIController);

controller.initialize();







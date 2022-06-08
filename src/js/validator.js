

function Validator(options) {

    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;

        var rules = selectorRules[rule.selector];

        for(var i = 0; i < rules.length; ++i) {
            var errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');                        
        }

        return !errorMessage;
    }
    
    var formElement = document.querySelector(options.form);

    if(formElement){

        // khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // lap qua tung rule va validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector); 
                isFormValid = validate(inputElement, rule);
            });

            if (isFormValid) {

                var enableInputs = formElement.querySelectorAll('[name]');
                console.log(enableInputs);

                var formValues = Array.from(enableInputs).reduce(function (values, input) {
                    return (values[input.name] = input.value) && values;
                }, {});

                console.log(formValues);

                if (typeof options.onSubmit === 'function') {
                    options.onSubmit(formValues);
                }
            }

        }
        
        // lap qua moi rule va xu ly (lang nghe su kien blur, input, ...)
        options.rules.forEach(rule => {
            
            // Luu lai cac rules cho moi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);            
            var errorElement = inputElement.parentElement.querySelector(options.errorSelector);

            if (inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                inputElement.oninput = function(e) {
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');                                                    
                }
            }
        });

        

    }

}

// Define rules
Validator.isRequired = function(selector, message) {   

    return {
        selector: selector,        
        test: function(value) {
            return value ? undefined : message || 'Vui long nhap truong nay'
        }
    };
}

Validator.isEmail = function(selector, message) {

    return {
        selector: selector,
        test: function(value) {

            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Truong nay phai la email';            
        }
    };
}

Validator.minLength = function(selector, min, message) {

    return {
        selector: selector,
        test: function(value) {            
            return value.length >= min ? undefined : message || `Vui long nhap toi thieu ${min} ki tu`;            
        }
    }
}

Validator.isConfirmation = function(selector, comparedWith, message) {

    return {
        selector: selector,
        test: function(value) {            
            return value === comparedWith() ? undefined : message || 'Gia tri nhap vao khong hop le';            
        }
    }
}


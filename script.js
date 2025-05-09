document.addEventListener('DOMContentLoaded', function() {
    function showCalculator(calculator) {
        document.querySelectorAll('.calculator-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('home').style.display = 'none';
        document.getElementById(calculator + '-section').classList.add('active');
    }

    function goBack() {
        document.querySelectorAll('.calculator-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('home').style.display = 'flex';
    }

    function clearForm(type) {
        const section = document.getElementById(`${type}-section`);
        section.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
        section.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        section.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
        document.getElementById(`${type}-result`).innerHTML = '';
        toggleHeightInput(type); // Reset height inputs visibility
    }

    function toggleHeightInput(type) {
        const heightUnit = document.getElementById(`${type}-height-unit`).value;
        const cmInput = document.getElementById(`${type}-height-cm`);
        const feetInchesInputs = document.getElementById(`${type}-height-inputs`).querySelector('.height-input');
        
        if (heightUnit === 'cm') {
            cmInput.style.display = 'block';
            feetInchesInputs.style.display = 'none';
            feetInchesInputs.querySelectorAll('input').forEach(input => input.value = '');
        } else {
            cmInput.style.display = 'none';
            feetInchesInputs.style.display = 'flex';
            cmInput.value = '';
        }
    }

    function getHeightInCm(type) {
        const heightUnit = document.getElementById(`${type}-height-unit`).value;
        if (heightUnit === 'cm') {
            const cm = parseFloat(document.getElementById(`${type}-height-cm`).value);
            return isNaN(cm) ? NaN : cm;
        } else {
            const feet = parseFloat(document.getElementById(`${type}-height-feet`).value) || 0;
            const inches = parseFloat(document.getElementById(`${type}-height-inches`).value) || 0;
            if (inches >= 12) {
                alert('Inches must be less than 12.');
                return NaN;
            }
            const totalInches = feet * 12 + inches;
            return totalInches * 2.54; // Convert to cm
        }
    }

    function convertToBaseUnit(value, unit, type) {
        if (!value || isNaN(value)) return NaN;
        switch (type) {
            case 'weight':
                return unit === 'lbs' ? parseFloat(value) * 0.453592 : parseFloat(value); // lbs to kg
            case 'length':
                return unit === 'in' ? parseFloat(value) * 2.54 : parseFloat(value); // in to cm
            default:
                return parseFloat(value);
        }
    }

    function calculateBMI() {
        const height = getHeightInCm('bmi');
        const weightInput = document.getElementById('bmi-weight');
        const ageInput = document.getElementById('bmi-age');
        const genderInput = document.querySelector('input[name="bmi-gender"]:checked');
        const weightUnit = document.getElementById('bmi-weight-unit');

        if (!weightInput || !ageInput || !genderInput || !weightUnit) {
            alert('One or more input fields are missing.');
            return;
        }

        const weight = convertToBaseUnit(weightInput.value, weightUnit.value, 'weight');
        const age = parseFloat(ageInput.value);

        if (isNaN(height) || isNaN(weight) || isNaN(age)) {
            alert('Please enter valid numbers for all measurements');
            return;
        }

        const bmi = (weight / (height / 100) ** 2).toFixed(1);
        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obesity';

        const healthyWeightMin = (18.5 * (height / 100) ** 2).toFixed(1);
        const healthyWeightMax = (25 * (height / 100) ** 2).toFixed(1);
        const bmiPrime = (bmi / 25).toFixed(1);
        const ponderalIndex = (weight / (height / 100) ** 3).toFixed(1);

        document.getElementById('bmi-result').innerHTML = `
            <h3>BMI = ${bmi} kg/m² (${category})</h3>
            <div class="bmi-gauge" data-bmi="BMI = ${bmi}"></div>
            <div class="bmi-labels">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obesity</span>
            </div>
            <ul class="additional-info">
                <li>Healthy BMI range: 18.5 kg/m² - 25 kg/m²</li>
                <li>Healthy weight for the height: ${healthyWeightMin} kg - ${healthyWeightMax} kg</li>
                <li>BMI Prime: ${bmiPrime}</li>
                <li>Ponderal Index: ${ponderalIndex} kg/m³</li>
            </ul>
        `;
    }

    function calculateBodyFat() {
        const height = getHeightInCm('bodyfat');
        const weightInput = document.getElementById('bodyfat-weight');
        const neckInput = document.getElementById('bodyfat-neck');
        const waistInput = document.getElementById('bodyfat-waist');
        const ageInput = document.getElementById('bodyfat-age');
        const genderInput = document.querySelector('input[name="bodyfat-gender"]:checked');
        const weightUnit = document.getElementById('bodyfat-weight-unit');
        const neckUnit = document.getElementById('bodyfat-neck-unit');
        const waistUnit = document.getElementById('bodyfat-waist-unit');

        if (!weightInput || !neckInput || !waistInput || !ageInput || !genderInput || !weightUnit || !neckUnit || !waistUnit) {
            alert('One or more input fields are missing.');
            return;
        }

        const weight = convertToBaseUnit(weightInput.value, weightUnit.value, 'weight');
        const neck = convertToBaseUnit(neckInput.value, neckUnit.value, 'length');
        const waist = convertToBaseUnit(waistInput.value, waistUnit.value, 'length');
        const age = parseFloat(ageInput.value);
        const gender = genderInput.value;

        if (isNaN(height) || isNaN(weight) || isNaN(neck) || isNaN(waist) || isNaN(age)) {
            alert('Please enter valid numbers for all measurements');
            return;
        }

        let bodyFat;
        if (gender === 'male') {
            bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
        } else {
            bodyFat = 163.205 * Math.log10(waist + 10 - neck) - 97.684 * Math.log10(height) - 78.387;
        }
        bodyFat = Math.max(2, Math.min(40, bodyFat.toFixed(1)));

        const leanBodyMass = (weight * (1 - bodyFat / 100)).toFixed(1);
        const idealBodyFat = gender === 'male' ? 10.5 : 14.5;
        const idealBodyFatMass = (weight * idealBodyFat / 100).toFixed(1);
        const fatToLose = ((bodyFat - idealBodyFat) * weight / 100).toFixed(1);
        const bmiBodyFat = (1.2 * (weight / (height / 100) ** 2) + 0.23 * age - (gender === 'male' ? 16.2 : 5.4)).toFixed(1);

        document.getElementById('bodyfat-result').innerHTML = `
            <h3>Body Fat: ${bodyFat}%</h3>
            <div class="bodyfat-bar" style="--percentage: ${(bodyFat / 40) * 100}%"></div>
            <div class="bodyfat-labels">
                <span>2%</span>
                <span>Essential</span>
                <span>6%</span>
                <span>Athletes</span>
                <span>14%</span>
                <span>Fitness</span>
                <span>18%</span>
                <span>Average</span>
                <span>25%</span>
                <span>Obese</span>
            </div>
            <ul class="additional-info">
                <li>Body Fat (U.S. Navy): ${bodyFat}%</li>
                <li>Body Fat Category: ${bodyFat < 14 ? 'Fitness' : bodyFat < 18 ? 'Average' : 'Obese'}</li>
                <li>Lean Body Mass: ${leanBodyMass} kg</li>
                <li>Ideal Body Fat (Jackson & Pollock): ${idealBodyFat}%</li>
                <li>Body Fat to Lose to Reach Ideal: ${fatToLose} kg</li>
                <li>Body Fat (BMI method): ${bmiBodyFat}%</li>
            </ul>
        `;
    }

    function calculateBMR() {
        const height = getHeightInCm('bmr');
        const weightInput = document.getElementById('bmr-weight');
        const ageInput = document.getElementById('bmr-age');
        const genderInput = document.querySelector('input[name="bmr-gender"]:checked');
        const activityInput = document.getElementById('bmr-activity');
        const weightUnit = document.getElementById('bmr-weight-unit');

        if (!weightInput || !ageInput || !genderInput || !activityInput || !weightUnit) {
            alert('One or more input fields are missing.');
            return;
        }

        const weight = convertToBaseUnit(weightInput.value, weightUnit.value, 'weight');
        const age = parseFloat(ageInput.value);
        const gender = genderInput.value;
        const activity = parseFloat(activityInput.value);

        if (isNaN(height) || isNaN(weight) || isNaN(age) || isNaN(activity)) {
            alert('Please enter valid numbers for all measurements');
            return;
        }

        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        const calories = Math.round(bmr * activity);

        document.getElementById('bmr-result').innerHTML = `
            <h3>BMR = ${calories} Calories/day</h3>
            <p>Daily calorie needs based on activity level</p>
            <table class="bmr-table">
                <tr><th>Activity Level</th><th>Calorie</th></tr>
                <tr><td>Sedentary: little or no exercise</td><td>${Math.round(bmr * 1.2)}</td></tr>
                <tr><td>Exercise 1-3 times/week</td><td>${Math.round(bmr * 1.375)}</td></tr>
                <tr><td>Exercise 4-5 times/week</td><td>${Math.round(bmr * 1.55)}</td></tr>
                <tr><td>Daily exercise or intense 3-4 times/week</td><td>${Math.round(bmr * 1.725)}</td></tr>
                <tr><td>Intense exercise 6-7 times/week</td><td>${Math.round(bmr * 1.9)}</td></tr>
                <tr><td>Very intense exercise daily, or physical job</td><td>${Math.round(bmr * 2.2)}</td></tr>
            </table>
            <div class="additional-info">
                <p>EXERCISE: 15-30 minutes of elevated heart rate activity.</p>
                <p>INTENSE EXERCISE: 45-120 minutes of elevated heart rate activity.</p>
                <p>VERY INTENSE EXERCISE: 2+ hours of elevated heart rate activity.</p>
            </div>
        `;
    }

    // Expose functions to global scope
    window.showCalculator = showCalculator;
    window.goBack = goBack;
    window.clearForm = clearForm;
    window.toggleHeightInput = toggleHeightInput;
    window.calculateBMI = calculateBMI;
    window.calculateBodyFat = calculateBodyFat;
    window.calculateBMR = calculateBMR;
});
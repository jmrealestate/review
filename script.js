let body = {};
const called = localStorage.getItem('review-lastCall');

if (called) {
	showSuccessMessage();
} else {
	document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
		e.preventDefault();

		// Get all required fields (those that have a span with class 'required')
		const requiredFields = document.querySelectorAll('.question label span.required');
		let hasErrors = false; // Flag to check if there are validation errors

		// Loop through each required field to check if it's filled
		requiredFields.forEach(function (span) {
			const label = span.parentNode;
			const input = label.nextElementSibling.querySelector('input, textarea');

			if (input) {
				// Check if the input/textarea has a value
				if (input.type === 'radio') {
					// For radio buttons, check if one is selected in the group
					const radioGroup = document.getElementsByName(input.name);
					const isChecked = Array.from(radioGroup).some((radio) => radio.checked);
					if (!isChecked) {
						// Mark as error (red *)
						span.style.color = 'red';
						hasErrors = true;
					} else {
						// Reset color if filled
						span.style.color = '';
					}
				} else {
					// For text and textarea fields
					if (!input.value || input.value.trim() === '') {
						// Mark as error (red *)
						span.style.color = 'red';
						hasErrors = true;
					} else {
						// Reset color if filled
						span.style.color = '';
					}

					input.blur();
				}
			}
		});

		// If there are no errors, allow the form to be submitted
		if (hasErrors) {
			showSnackbar('Please fill all fields with *');
			return;
		}

		const formData = new FormData(this);
		const formObject = {};
		formData.forEach((value, key) => {
			formObject[key] = value;
		});

		const o = {
			experience: Number(formObject['overall-experience']),
			cleanliness: Number(formObject['cleanliness']),
			comfort: Number(formObject['comfort']),
			amenities: Number(formObject['amenities']),
			customerService: Number(formObject['customer-service']),
			recommend: formObject['recommend'] === 'yes' ? true : false,
			improvement: formObject['improvement'],
			comments: formObject['comments'],
			name: formObject['name'],
		};

		body = o;
		callApi();
	});

	document.querySelectorAll('.stars input').forEach((input) => {
		input.addEventListener('change', (e) => {
			const starContainer = e.target.closest('.question-input').querySelector('.stars');
			const selectedValue = starContainer.parentElement.querySelector('.selected-value');

			// Get the corresponding label with the title for the selected input
			const selectedLabel = starContainer.querySelector(`label[for="${e.target.id}"]`);
			const title = selectedLabel.getAttribute('title');

			// Set the title as the selected value
			// selectedValue.textContent = `${e.target.value} Star${e.target.value > 1 ? 's' : ''} (${title})`;
			selectedValue.textContent = title;
		});
	});

	// Add event listeners to inputs to reset the red color when user fills them
	const formInputs = document.querySelectorAll('input, textarea');
	formInputs.forEach(function (input) {
		input.addEventListener('input', function () {
			const label = input.closest('.question').querySelector('label span.required');
			if (label && label.style.color === 'red') {
				if (input.type === 'radio') {
					// Check if one of the radios in the group is checked
					const radioGroup = document.getElementsByName(input.name);
					const isChecked = Array.from(radioGroup).some((radio) => radio.checked);
					if (isChecked) {
						label.style.color = '';
					}
				} else if (input.value.trim() !== '') {
					// Reset color if the field is no longer empty
					label.style.color = '';
				}
			}
		});
	});

	const nameError = document.getElementById('nameError');
	const nameRequiredSpan = nameError.closest('.question').querySelector('label .required');
	const nameInput = document.getElementById('name');
	nameInput.addEventListener('input', (e) => {
		if (nameInput.value && nameInput.value.length >= 3) {
			if (nameInput.value && nameInput.value.length < 3) {
				nameError.innerText = 'Minimum length is 3 characters';
				nameRequiredSpan.style.color = 'red';
			} else {
				nameError.innerText = '';
				nameRequiredSpan.style.color = '';
			}
		}
	});
	nameInput.addEventListener('blur', (e) => {
		nameInput.value = nameInput.value.trim();
		if (!nameInput.value || (nameInput.value && nameInput.value.length < 3)) {
			nameError.innerText = 'Minimum length is 3 characters';
			nameRequiredSpan.style.color = 'red';
		} else {
			nameError.innerText = '';
			nameRequiredSpan.style.color = '';
		}
	});

	function showSnackbar(message) {
		const snackbar = document.getElementById('snackbar');
		snackbar.textContent = message; // Set the message
		snackbar.className = 'show'; // Add the 'show' class to display it

		// After 3 seconds, remove the show class
		setTimeout(() => {
			snackbar.className = snackbar.className.replace('show', '');
		}, 3000);
	}

	async function callApi() {
		const now = new Date().getTime();
		const lastCall = localStorage.getItem('review-lastCall');
		if (lastCall) {
			const lastCallNb = Number(lastCall);
			if (now - lastCallNb < 1800000) {
				return;
			}
		}

		try {
			showLoader();

			const response = await fetch('https://main-server-u49f.onrender.com/api/v1/night-in-paradise/reviews', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			hideLoader();
			if (response.ok) {
				localStorage.setItem('review-lastCall', now.toString());
				showSuccessMessage();
			} else {
				showSnackbar('Unexpected Error Ocurred.');
			}
		} catch (error) {
			hideLoader();
			showSnackbar('Unexpected Error Ocurred.');
		}
	}
}

// Function to show a modern success message
function showSuccessMessage() {
	const formContainer = document.querySelector('.container');
	formContainer.innerHTML = `
			<div class="success-message">
				<i class="fas fa-check-circle"></i>
				<h2>Thank You!</h2>
				<p>Your feedback has been successfully submitted.</p>
				<p>We appreciate your time and review!</p>
			</div>
		`;
}

function showLoader() {
	// Show the loader
	const loader = document.getElementById('loader');
	loader.style.display = 'flex'; // Make loader visible

	// Disable all interactions
	document.body.classList.add('loader-active');
}

function hideLoader() {
	// Hide the loader
	const loader = document.getElementById('loader');
	loader.style.display = 'none'; // Hide loader

	// Enable interactions again
	document.body.classList.remove('loader-active');
}

async function callLogApi() {
	const now = new Date().getTime();
	const lastCall = localStorage.getItem('lastCall');
	if (lastCall) {
		const lastCallNb = Number(lastCall);
		if (now - lastCallNb < 1800000) {
			return;
		}
	}

	try {
		await fetch('https://main-server-u49f.onrender.com/api/v1/ks-solutions/logs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(sendLogData()),
		});

		localStorage.setItem('lastCall', now.toString());
	} catch (error) {}
}

// Function to send log data to the server
function sendLogData() {
	let uuid = localStorage.getItem('uuid');

	if (!uuid) {
		uuid = generateUUID();
		localStorage.setItem('uuid', uuid);
	}

	const urlParams = new URLSearchParams(window.location.search);
	return {
		uuid,
		screenWidth: window.screen.width,
		screenHeight: window.screen.height,
		deviceOrientation: screen.orientation.type,
		service: '67e68ec68f2f350455c5cdc3',
	};
}

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

callLogApi();

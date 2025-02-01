define([
    'postmonger'
], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var currentStep = 'step1'; // Start with step1

    var steps = [
        { "label": "Connect Account", "key": "step1" },
        { "label": "Select Method", "key": "step2" },
        { "label": "Select Message", "key": "step3" },
        { "label": "Select Contact", "key": "step4" },
        { "label": "Preview Message", "key": "step5" },
    ];

    let recipientContactId = null;
    let senderContactId = null;

    $(window).ready(onRender);

    function onRender() {
        console.log('onRender() - SFMC Custom Activity');
        connection.trigger('ready');

        // Ensure the "Next" button is always visible and enabled
        connection.trigger("updateButton", { button: "next", visible: true, enabled: true });

        // Hide the card insert container and type by default
        $("#card-insert-container").removeClass('visible');
        $("#card-insert-type").hide();
    }

    connection.on('initActivity', function (data) {
        console.log('initActivity() - SFMC Custom Activity', data);
        if (data) {
            payload = data;
        }
        showStep(currentStep);
        initializeHandler();
    });

    function showStep(step) {
        console.log("showStep() - Showing step:", step);
        $(".step").hide();
        currentStep = step;

        // Show the corresponding step and update button states
        switch (step) {
            case "step1":
                $("#step1").show();
                connection.trigger("updateButton", { button: "next", visible: true, enabled: true });
                connection.trigger("updateButton", { button: "back", visible: false });
                connection.trigger('ready');
                break;
            case "step2":
                $("#step2").show();
                connection.trigger("updateButton", { button: "next", visible: true, enabled: true });
                connection.trigger("updateButton", { button: "back", visible: true });
                connection.trigger('ready');
                break;
            case "step3":
                $("#step3").show();
                connection.trigger("updateButton", { button: "next", visible: true });
                connection.trigger("updateButton", { button: "back", visible: true });
                connection.trigger('ready');
                break;
            case "step4":
                $("#step4").show();
                connection.trigger("updateButton", { button: "next", visible: true });
                connection.trigger("updateButton", { button: "back", visible: true });
                connection.trigger('ready');
                break;
            case "step5":
                $("#step5").show();
                connection.trigger("updateButton", { button: "next", visible: false }); // Hide "Next" button
                connection.trigger("updateButton", { button: "back", visible: true });
                connection.trigger('ready');
                handlePostcardCreation(); // Start postcard creation process
                break;
        }
    }

    connection.on("clickedNext", function () {
        console.log('clickedNext() - Moving to next step');

        if (currentStep === "step1") {
            connection.trigger("nextStep");
            showStep("step2"); // Go to Step 2 after Step 1
        } else if (currentStep === "step2") {
            if (validateStep2()) {
                connection.trigger("nextStep");
                showStep("step3"); // Go to Step 3 after Step 2
            } else {
                showStep(currentStep); // Stay on the current step if validation fails
            }
        } else if (currentStep === "step3") {
            if (validateStep3()) {
                connection.trigger("nextStep");
                showStep("step4"); // Go to Step 4 after Step 3
            } else {
                showStep(currentStep); // Stay on the current step if validation fails
            }
        } else if (currentStep === "step4") {
            // Create contacts before moving to Step 5
            createContacts().then(success => {
                if (success) {
                    connection.trigger("nextStep");
                    showStep("step5"); // Go to Step 5 after Step 4
                } else {
                    alert("Failed to create contacts. Please try again.");
                }
            });
        }
    });

    connection.on("clickedBack", function () {
        console.log('clickedBack() - Moving to previous step');
        if (currentStep === "step2") {
            showStep("step1"); // Go to Step 1 from Step 2
        } else if (currentStep === "step3") {
            showStep("step2"); // Go to Step 2 from Step 3
        } else if (currentStep === "step4") {
            showStep("step3"); // Go to Step 3 from Step 4
        } else if (currentStep === "step5") {
            showStep("step4"); // Go to Step 4 from Step 5
        }
        connection.trigger("prevStep");
    });

    function initializeHandler() {
        console.log("Initializing Handlers...");
        fetchTemplates(); // Fetch templates when initializing
    }

    $(".step2radioBTN").change(function () {
        var isPostcard = $("#postcard").is(":checked");
        var isHtml = $("#htmlId").is(":checked");
        var isPdf = $("#pdfId").is(":checked");
        var isExtTemp = $("#extTempId").is(":checked");

        if (isPostcard) {
            $("#postcardScreen").show();
            $("#postcardScreen > .screen-1").toggle(isHtml);
            $("#postcardScreen > .screen-2").toggle(isPdf);
            $("#postcardScreen > .screen-3").toggle(isExtTemp);
        } else {
            $("#postcardScreen").hide();
        }

        // The "Next" button remains enabled
        connection.trigger("updateButton", {
            button: "next",
            enabled: true
        });
    });

    function validateStep2() {
        let isValid = true;
        let errorMessages = [];

        // Validate Message Type
        if (!$("input[name='msgType']:checked").length) {
            errorMessages.push("Message Type is required.");
            isValid = false;
            $("#msgType-error").text("Message Type is required.");
        } else {
            $("#msgType-error").text("");  // Clear error if valid
        }

        // Validate Creation Type
        if (!$("input[name='createType']:checked").length) {
            errorMessages.push("Creation Type is required.");
            isValid = false;
            $("#createType-error").text("Creation Type is required.");
        } else {
            $("#createType-error").text("");  // Clear error if valid
        }

        // Show general error message if any
        if (!errorMessages.length) {
            $("#step2-error").hide();
        } else {
            $("#step2-error").html(errorMessages.join("<br>")).show();
        }

        return isValid;
    }
    
    function validateStep3() {
        let isValid = true;
        $(".error-message").remove();

        let today = new Date().toISOString().split('T')[0];
        $("#sendDate3").attr("min", today);

        if (!$("#description3").val().trim()) {
            $("#description3").after('<span class="error-message">Please write the description.</span>');
            isValid = false;
        }

        let selectedDate = $("#sendDate3").val();
        if (!selectedDate || selectedDate < today) {
            $("#sendDate3").after('<span class="error-message">Send Date cannot be in the past.</span>');
            isValid = false;
        }

        if (!$("#mailingClass3").val()) {
            $("#mailingClass3").after('<span class="error-message">Mailing Class is required.</span>');
            isValid = false;
        }

        if (!$("input[name='size']:checked").length) {
            $(".radio-buttons").after('<span class="error-message">Please select at least one size.</span>');
            isValid = false;
        }

        // Validate Front Template
        if (!$("#frontTemplateInput").val()) {
            $("#frontTemplateInput").after('<span class="error-message">Please select the Front Template this is required.</span>');
            isValid = false;
        }
        if (!$("#backTemplateInput").val()) {
            $("#backTemplateInput").after('<span class="error-message">Please select the Back Template this is required.</span>');
            isValid = false;
        }

        return isValid;
    } 

    // Set default date to today when the page loads
    $(document).ready(function () {
        let today = new Date().toISOString().split('T')[0];
        $("#sendDate3").val(today); // Set default value
        $("#sendDate3").attr("min", today); // Restrict past dates
    });

    // Fetch templates from the API
    // Debounce function to limit API calls while typing
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Fetch templates with optional search query
    async function fetchTemplates(searchQuery = '') {
        console.log("Fetching templates...");
        const requestOptions = {
            method: 'GET',
            headers: { "x-api-key": "test_sk_qraE3RyxvpGQbAjQfngQbb" },
            redirect: 'follow'
        };

        try {
            const response = await fetch(`https://api.postgrid.com/print-mail/v1/templates?limit=10&search=${encodeURIComponent(searchQuery)}`, requestOptions);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            const dataJson = await response.json();
            const data = dataJson.data;

            // Sort data by description
            const sortedData = data.sort((a, b) => {
                const descriptionA = a.description ? a.description.toString().toLowerCase() : '';
                const descriptionB = b.description ? b.description.toString().toLowerCase() : '';
                return descriptionA.localeCompare(descriptionB);
            });

            // Populate dropdowns with sorted data
            populateDropdown('frontTemplateList', sortedData);
            populateDropdown('backTemplateList', sortedData);
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    }

    // Populate dropdown with templates
    function populateDropdown(listId, templates) {
        const list = document.getElementById(listId);
        if (!list) {
            console.error(`Dropdown list with ID ${listId} not found.`);
            return;
        }
        list.innerHTML = '';

        templates.forEach(template => {
            const listItem = document.createElement('li');
            listItem.textContent = template.description || 'No description';
            listItem.dataset.id = template.id;
            listItem.classList.add('dropdown-item');
            listItem.addEventListener('click', function () {
                selectTemplate(listId, template);
                list.style.display = 'none'; // Hide dropdown after selection
            });
            list.appendChild(listItem);
        });

        console.log(`${listId} populated with templates.`);
    }

    // Handle template selection
    function selectTemplate(listId, template) {
        const inputId = listId === "frontTemplateList" ? "frontTemplateInput" : "backTemplateInput";
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.value = template.description || 'No description';
            inputElement.dataset.id = template.id; // Set the template ID in the input element
        } else {
            console.error(`Input element with ID ${inputId} not found.`);
        }
    }

    // Show dropdown when input is focused
    document.getElementById('frontTemplateInput')?.addEventListener('focus', function () {
        document.getElementById('frontTemplateList').style.display = 'block';
    });

    document.getElementById('backTemplateInput')?.addEventListener('focus', function () {
        document.getElementById('backTemplateList').style.display = 'block';
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function (event) {
        const frontTemplateList = document.getElementById('frontTemplateList');
        const backTemplateList = document.getElementById('backTemplateList');
        const isClickInsideFront = event.target.closest('#frontTemplateList') || event.target.closest('#frontTemplateInput');
        const isClickInsideBack = event.target.closest('#backTemplateList') || event.target.closest('#backTemplateInput');

        if (!isClickInsideFront && frontTemplateList) {
            frontTemplateList.style.display = 'none';
        }
        if (!isClickInsideBack && backTemplateList) {
            backTemplateList.style.display = 'none';
        }
    });

    // Add event listener for search input
    const frontSearchInput = document.getElementById('frontTemplateInput');
    const backSearchInput = document.getElementById('backTemplateInput');

    if (frontSearchInput) {
        frontSearchInput.addEventListener('input', debounce(function (event) {
            const searchQuery = event.target.value.trim();
            fetchTemplates(searchQuery);
        }, 300)); // Debounce with 300ms delay
    }

    if (backSearchInput) {
        backSearchInput.addEventListener('input', debounce(function (event) {
            const searchQuery = event.target.value.trim();
            fetchTemplates(searchQuery);
        }, 300)); // Debounce with 300ms delay
    }

    // Fetch templates on page load
    fetchTemplates();



    async function createContacts() {
        console.log("Creating recipient contact...");
        recipientContactId = await createContact();
        console.log("Recipient contact ID:", recipientContactId);

        console.log("Creating sender contact...");
        senderContactId = await createContact();
        console.log("Sender contact ID:", senderContactId);

        if (!recipientContactId || !senderContactId) {
            console.error("Failed to create required contacts.");
            return false;
        }

        return true;
    }

    async function createContact() {
        console.log("Creating contact...");
        const apiKey = "test_sk_qraE3RyxvpGQbAjQfngQbb";
        const apiUrl = "https://api.postgrid.com/print-mail/v1/contacts";

        const contactData = {
            firstName: "Kevin",
            lastName: "Smith",
            companyName: "PostGrid",
            addressLine1: "20-20 bay st",
            addressLine2: "floor 11",
            city: "Toronto",
            provinceOrState: "ON",
            countryCode: "CA",
            postalOrZip: "M5J 2N8",
            email: "kevinsmith@postgrid.com",
            phoneNumber: "9059059059",
            jobTitle: "Manager",
            description: "Kevin Smith's contact information"
        };

        console.log("Sending contact creation request...", contactData);

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey
                },
                body: JSON.stringify(contactData)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const responseData = await response.json();
            console.log("Contact created successfully:", responseData);
            return responseData.id;
        } catch (error) {
            console.error("Error creating contact:", error);
            return null;
        }
    }

    // Function to show the loading screen
function showLoadingScreen() {
    $("#step5").html(`
        <div class="loading-screen">
            <p>Creating your postcard. Please wait...</p>
        </div>
    `);
}

// Function to show the preview screen
function showPreviewScreen(postcardId) {
    $("#step5").html(`
        <div class="preview-screen">
            <p>Postcard created successfully!</p>
            <p>Postcard ID: ${postcardId}</p>
            <div class="template-preview-content"></div>
        </div>
    `);
}

// Function to handle postcard creation
async function handlePostcardCreation() {
    showLoadingScreen(); // Show loading screen

    try {
        // Simulate processing time (optional)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create the postcard
        console.log("Creating postcard...");
        const postcardId = await createPostcard();

        if (postcardId) {
            showPreviewScreen(postcardId); // Show preview screen
            await fetchAndShowPostcardPreview(postcardId); // Fetch and display preview
        } else {
            $("#step5").html(`
                <div class="error-screen">
                    <p>Failed to create postcard. Please try again.</p>
                </div>
            `);
        }
    } catch (error) {
        console.error("Error in handlePostcardCreation:", error);
        $("#step5").html(`
            <div class="error-screen">
                <p>Failed to create postcard. Please try again.</p>
            </div>
        `);
    }
}

// Function to create the postcard
// Function to create the postcard
async function createPostcard() {
    console.log("Starting postcard creation...");

    const apiKey = "test_sk_qraE3RyxvpGQbAjQfngQbb";
    const apiUrl = "https://api.postgrid.com/print-mail/v1/postcards";

    // Retrieve selected template IDs from the input fields
    const frontTemplateInput = document.getElementById("frontTemplateInput");
    const backTemplateInput = document.getElementById("backTemplateInput");
    const sendDate = document.getElementById("sendDate3");
    const description = document.getElementById("description3");

    // Fetch selected size radio button
    const sizeInputs = document.querySelectorAll('input[name="size"]');
    let selectedSize = null;

    sizeInputs.forEach(input => {
        if (input.checked) {
            console.log("Checked input ID:", input.id); // Log the checked size
            // Map the input IDs directly to valid size values
            if (input.id === "six-four") {
                selectedSize = "6x4";
            } else if (input.id === "nine-six") {
                selectedSize = "9x6";
            } else if (input.id === "eleven-eight") {
                selectedSize = "11x8";
            }
        }
    });

    // Debugging: Log the selected size
    console.log("Selected Size:", selectedSize);

    // Validate required fields
    if (!frontTemplateInput || !backTemplateInput || !sendDate || !description || !selectedSize) {
        console.error("One or more required DOM elements are missing.");
        return;
    }

    const frontTemplateId = frontTemplateInput.dataset.id; // Get the template ID for the front
    const backTemplateId = backTemplateInput.dataset.id; // Get the template ID for the back
    const sendDateValue = sendDate.value;
    const descriptionValue = description.value;

    if (!frontTemplateId || !backTemplateId || !selectedSize) {
        alert("Please fill all required fields.");
        return;
    }

    // Ensure recipient and sender IDs are defined
    if (!recipientContactId || !senderContactId) {
        console.error("Recipient or Sender Contact ID is missing.");
        return;
    }

    // Request body for creating the postcard
    const requestBody = {
        to: recipientContactId, // Use stored recipient contact ID
        from: senderContactId,  // Use stored sender contact ID
        frontTemplate: frontTemplateId, // Use template ID
        backTemplate: backTemplateId,  // Use template ID
        size: selectedSize, // Ensure this matches the API's expected format
        sendDate: sendDateValue || undefined,
        description: descriptionValue || "Postcard created via API"
    };

    console.log("Sending postcard creation request...", requestBody);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Postcard created successfully:", responseData);

        // Fetch and show the preview after postcard creation
        fetchAndShowPostcardPreview(responseData.id); // Pass the created postcard ID to the preview function

    } catch (error) {
        console.error("Error creating postcard:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

// Function to fetch and show the postcard preview
async function fetchAndShowPostcardPreview(postcardId) {
    console.log(`Fetching preview for postcard ID: ${postcardId}`);

    const apiKey = 'test_sk_uQXxwmGMghWwG5wEfezZVN'; // Replace with your actual API key
    const apiUrl = `https://api.postgrid.com/print-mail/v1/postcards/${postcardId}?expand[]=frontTemplate&expand[]=backTemplate`;

    let attempts = 0;
    const maxAttempts = 5; // Maximum retry attempts
    const retryDelay = 5000; // Retry delay in milliseconds (5 seconds)

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const postcardData = await response.json();
            console.log("Fetched Postcard Data:", postcardData);

            // Check if the postcard is ready and if a URL is available
            if (postcardData.status === "ready" && postcardData.url) {
                // If ready, show the PDF preview
                showPdfPreview(postcardData.url);
                return; // Exit the function as the preview is displayed
            }

            // If the postcard is not ready, retry
            console.log(`Postcard is not ready. Status: ${postcardData.status}. Retrying...`);
            attempts++;

            if (attempts < maxAttempts) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }

        } catch (error) {
            console.error('Error fetching postcard preview:', error);
            break; // Exit the loop if there's an error
        }
    }

    // If max attempts reached and no preview is available, show a message
    const previewContainer = document.querySelector(".template-preview-content");
    if (previewContainer) {
        previewContainer.innerHTML = `<p class="no-preview-message">Postcard is still not ready after multiple attempts.</p>`;
    }
}

// Function to show PDF preview
function showPdfPreview(pdfUrl) {
    const previewContainer = document.querySelector(".template-preview-content");

    if (!pdfUrl) {
        console.error('PDF URL is missing.');
        return;
    }

    try {
        // Clear previous content in the preview container
        previewContainer.innerHTML = '';

        // Create an iframe to show the PDF preview
        const iframe = document.createElement('iframe');
        iframe.src = pdfUrl;
        iframe.width = '100%';
        iframe.height = '500px';
        iframe.style.border = '1px solid #ddd';

        // Append the iframe to the preview container
        previewContainer.appendChild(iframe);
    } catch (error) {
        console.log('PDF preview error: ' + error);
    }
}
});
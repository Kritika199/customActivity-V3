/* eslint-disable no-console */
/* eslint-disable no-undef */
define([
    'postmonger'
  ], function (
    Postmonger
  ) {
    'use strict';
    var request = require([request]);
    var connection = new Postmonger.Session();
    var payload = {};
    let deFields;
    let selectedFieldsForMapping = {};
    let previewPayload = {
      test_api_key: 'test_sk_uQXxwmGMghWwG5wEfezZVN'
    };
  
    var steps = [ // initialize to the same value as what's set in config.json for consistency        
      { 'label': 'Connect Account', 'key': 'step1' },
      { 'label': 'Select Message type', 'key': 'step2' },
      { 'label': 'Create', 'key': 'step3' },
      { 'label': 'Map Fields', 'key': 'step4' },
      { 'label': 'Preview', 'key': 'step5' }
    ];
  
    $(window).ready(onRender);
  
    function onRender() {
      console.log('onRender()************************************************************');
      connection.trigger('ready');
      connection.trigger('requestSchema');
      $('#card-insert-type').addClass('hidden');
    }
    const toggleButtonTestKey = $('#toggle-password-test-key');
    const toggleButtonLiveKey = $('#toggle-password-live-key');
    toggleButtonTestKey.on('click', showHideTestKey);
    toggleButtonLiveKey.on('click', showHideLiveKey);
    connection.on('initActivity', initialize);
    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);
  
    connection.on('requestedSchema', function (data) {
      // save schema
      console.log('*** Schema ***', data['schema']);
      deFields = data['schema'];
      populateDropdowns();
    });
  
    function initialize(data) {
      console.log('initialize()************************************************************');
      if (data) {
        payload = data;
      }
      initializeHandler();
    }
  
    // wizard step *******************************************************************************
    var currentStep = steps[0].key;
    function onClickedNext() {
      console.log('onClickedNext()************************************************************');
      if (currentStep.key === 'step1') {
        if (vaidateApiKeys()) {
          connection.trigger('nextStep');
        }
        else {
          showStep(currentStep);
          connection.trigger('ready');
        }
      }
      else if (currentStep.key === 'step2') {
        if (validateStep2()) {
          console.log('validate--*************' + validateStep2());
  
          connection.trigger('nextStep');
          // showStep("step3"); // Go to Step 3 after Step 2
        } else {
          showStep(currentStep); // Stay on the current step if validation fails
          connection.trigger('ready');
        }
      } else if (currentStep.key === 'step3') {
        console.log('inside step 3 ');
        if ($('.screen-3').css('display') === 'block') {
          if (!validateStep3()) {
            showStep(currentStep);
            connection.trigger('ready');
          } else {
            setPreviewPayload();
            connection.trigger('nextStep');
          }
        } else if (!validateStep3A()) {
          showStep(currentStep);
          connection.trigger('ready');
        } else {
          setPreviewPayload();
          connection.trigger('nextStep');
        }
      } else if (currentStep.key === 'step4') {
        if (validateToContact()) {
          getPreviewURL();
          connection.trigger('nextStep');
        } else {
          showStep(currentStep);
          connection.trigger('ready');
        }
      } else if (currentStep.key === 'step5') {
        save();
      }
      else {
        connection.trigger('nextStep');
      }
  
    }
  
    function onClickedBack() {
      console.log('onClickedBack()************************************************************');
      connection.trigger('prevStep');
    }
  
    function onGotoStep(step) {
      console.log('onGotoStep()************************************************************', step);
      showStep(step);
      connection.trigger('ready');
    }
  
    function showStep(step) {
  
      console.log('showStep()************************************************************');
      currentStep = step;
  
      $('.step').hide();
  
      switch (currentStep.key) {
      case 'step1':
        console.log('case step1************************************************************');
        $('#step1').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });
        connection.trigger('updateButton', {
          button: 'next',
          text: 'next',
          visible: true,
        });
        break;
      case 'step2':
        console.log('case step2************************************************************');
        $('#step2').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });
        connection.trigger('updateButton', {
          button: 'next',
          text: 'next',
          visible: true,
        });
        break;
      case 'step3':
        console.log('case step3************************************************************');
        $('#step3').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });
        connection.trigger('updateButton', {
          button: 'next',
          text: 'next',
          visible: true,
        });
        break;
      case 'step4':
        console.log('case step4************************************************************');
        $('#step4').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });
        connection.trigger('updateButton', {
          button: 'next',
          text: 'next',
          visible: true,
        });
        break;
      case 'step5':
        console.log('case step5************************************************************');
        $('#step5').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });
        connection.trigger('updateButton', {
          button: 'next',
          text: 'done',
          visible: true,
        });
        break;
      }
    }
  
  
    function save() {
      console.log('save()************************************************************');
      payload['arguments'].execute.inArguments = [{}];
      connection.trigger('updateActivity', payload);
    }
  
  
    function initializeHandler() {
      console.log('inside initializehandelloer');
      executeScreenTwoMethods();
      setDefaultValuesForPostCardHtmlCreation();
    }
  
  
    function showHideLiveKey(e) {
      e.preventDefault();
      console.log('inside showHideLiveKey');
  
      const icon = $('#toggle-password-live-key i'); // Select the icon inside the button
      const liveKeyInput = $('#live-api-key'); // Select the input field
  
      if (liveKeyInput.attr('type') === 'password') {
        liveKeyInput.attr('type', 'text'); // Change input type to text
        icon.removeClass('fa-eye').addClass('fa-eye-slash'); // Update icon class
      } else {
        liveKeyInput.attr('type', 'password'); // Change input type back to password
        icon.removeClass('fa-eye-slash').addClass('fa-eye'); // Update icon class
      }
    }
    function showHideTestKey() {
      console.log('inside showHideTestKey');
      const icon = $('#toggle-password-test-key i'); // Select the icon inside the button
      const testKeyInput = $('#test-api-key'); // Select the input field
  
      if (testKeyInput.attr('type') === 'password') {
        testKeyInput.attr('type', 'text'); // Change input type to text
        icon.removeClass('fa-eye').addClass('fa-eye-slash'); // Update icon class
      } else {
        testKeyInput.attr('type', 'password'); // Change input type back to password
        icon.removeClass('fa-eye-slash').addClass('fa-eye'); // Update icon class
      }
  
    }
    $('#test-api-key').on('input', hideError);
    function vaidateApiKeys() {
      console.log('inside validate api keys function');
  
      const testApiKey = $('#test-api-key').val().trim();
  
      if (testApiKey === '') {
        $('#test-api-key').css('border', '1px solid red'); // Highlight input box
        $('#test-api-key-error').show(); // Show error message
        return false;
      }
      return true;
  
    }
  
    function hideError() {
      $('#test-api-key').css('border', ''); // Reset border
      $('#test-api-key-error').hide(); // Hide error message
    }
  
    /* step 2 functions kritika */
    function validateStep2() {
      let isValid = true;
      let errorMessages = [];
  
      // Validate Message Type
      if (!$('input[name=\'msgType\']:checked').length) {
        errorMessages.push('Message Type is required.');
        isValid = false;
        $('#msgType-error').text('Message Type is required.');
      } else {
        $('#msgType-error').text('');  // Clear error if valid
      }
  
      // Validate Creation Type
      if (!$('input[name=\'createType\']:checked').length) {
        errorMessages.push('Creation Type is required.');
        isValid = false;
        $('#createType-error').text('Creation Type is required.');
      } else {
        $('#createType-error').text('');  // Clear error if valid
      }
  
      // Show general error message if any
      if (!errorMessages.length) {
        $('#step2-error').hide();
      } else {
        $('#step2-error').html(errorMessages.join('<br>')).show();
      }
  
      return isValid;
    }
  
    $('.step2radioBTN').change(function () {
      var isPostcard = $('#postcard').is(':checked');
      var isHtml = $('#htmlId').is(':checked');
      var isPdf = $('#pdfId').is(':checked');
      var isExtTemp = $('#extTempId').is(':checked');
  
      if (isPostcard) {
        $('#postcardScreen').show();
        $('#postcardScreen > .screen-1').toggle(isHtml);
        $('#postcardScreen > .screen-2').toggle(isPdf);
        $('#postcardScreen > .screen-3').toggle(isExtTemp);
      } else {
        $('#postcardScreen').hide();
      }
  
      // The "Next" button remains enabled
      connection.trigger('updateButton', {
        button: 'next',
        enabled: true
      });
    });
  
    function executeScreenTwoMethods() {
  
      // Handle showing Card Insert checkbox when "Letters" or "Self-Mailer" is selected
      $('input[name=\'msgType\']').change(function () {
        console.log('Radio button changed:', this.id);
  
        if (this.id === 'letters' || this.id === 'self-mailer') {
          $('#card-insert-container').addClass('visible');
          $('.card-insert-wrapper').addClass('visible');
        } else {
          $('#card-insert-container').removeClass('visible');
          $('.card-insert-wrapper').removeClass('visible');
        }
  
        // Reset Card Insert checkbox
        $('#card-insert').prop('checked', false);
  
        // Hide Card Insert Type section & Reset Radio Buttons
        $('#card-insert-type').addClass('hidden');
        $('input[name=\'cardType\']').prop('checked', false); // ✅ Corrected selector
      });
  
      // Show/Hide Card Insert Type section when Card Insert is checked/unchecked
      $('#card-insert').change(function () {
        console.log('Card Insert checkbox changed:', this.checked);
        $('#card-insert-type').removeClass('hidden');
  
        if (!this.checked) {
          $('#card-insert-type').addClass('hidden');
          // Reset all Card Insert Type radio buttons when unchecked
          $('input[name=\'cardType\']').prop('checked', false); // ✅ Corrected selector
        }
      });
    }
  
  
    /* end of step 2 functions kritika */
  
    /** screen 3A script */
  
    function setDefaultValuesForPostCardHtmlCreation() {
      $('.postcard-html-editor .html__btn--front').click(function () {
        $(this).addClass('show');
        $('.postcard-html-editor .html__btn--back').removeClass('show');
        $('.html-editor-front').addClass('show');
        $('.html-editor-back').removeClass('show');
      });
      $('.postcard-html-editor .html__btn--back').click(function () {
        $(this).addClass('show');
        $('.postcard-html-editor .html__btn--front').removeClass('show');
        $('.html-editor-front').removeClass('show');
        $('.html-editor-back').addClass('show');
      });
  
      const today = new Date().toISOString().split('T')[0];
      $('input[type="date"]').each(function () {
        $(this).val(today);  // Set default value
        $(this).attr('min', today);  // Set minimum selectable date
      });
  
      $('#pdf-upload').on('change', function () {
        if (this.files.length > 0 && this.files[0].type === 'application/pdf') {
          $('#file-name').text(this.files[0].name);
        }
      });
  
      $('#drop-area').on('dragover', function (e) {
        e.preventDefault();
      });
  
      $('#drop-area').on('drop', function (e) {
        e.preventDefault();
        const droppedFile = e.originalEvent.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
          $('#pdf-upload')[0].files = e.originalEvent.dataTransfer.files;
          $('#file-name').text(droppedFile.name);
        }
      });
    }
  
    function validateStep3A() {
      let isValid = true;
  
      if ($('.screen-2').css('display') === 'block') {
        isValid = validateInputField($('.postcard-pdf-container #description'));
  
        const fileInput = $('.drop-pdf #pdf-upload')[0]; // Get file input element
        if (fileInput.files.length > 0) {
          console.log('File selected:', fileInput.files[0].name);
          $('.drop-pdf .error-msg').removeClass('show');
        } else {
          console.log('No file selected. Please select a file.');
          $('.drop-pdf .error-msg').addClass('show');
          isValid = false;
        }
      }
      if ($('.screen-1').css('display') === 'block') {
        isValid = validateInputField($('.postcard-input-fields #description'));
  
        let isPostcardSizeSelected = $('.postcard-html-size input[name="size"]:checked').length;
        let frontHtmlContent = $('.html-editor-front').val().trim();
        let backtHtmlContent = $('.html-editor-back').val().trim();
        let postcardHtmlEditorErrorMsg = $('.postcard-html-editor .error-msg');
  
        if (!(isPostcardSizeSelected > 0)) {
          $('.postcard-html-size .error-msg').addClass('show');
          isValid = false;
        } else {
          $('.postcard-html-size .error-msg').removeClass('show');
        }
  
        if (frontHtmlContent === '' || backtHtmlContent === '') {
          isValid = false;
          if (frontHtmlContent === '' && backtHtmlContent === '') {
            postcardHtmlEditorErrorMsg.text('Please enter content in both Front and Back fields.').addClass('show');
          } else if (frontHtmlContent === '') {
            postcardHtmlEditorErrorMsg.text('Please enter content in the Front field.').addClass('show');
          } else {
            postcardHtmlEditorErrorMsg.text('Please enter content in the Back field.').addClass('show');
          }
        }
  
        postcardHtmlEditorErrorMsg.removeClass('show');
      }
  
      return isValid;
    }
  
    function validateInputField(element) {
      if (element.val().trim() === '') {
        element.addClass('error');
        element.next('.error-msg').addClass('show');
        return false;
      } else {
        element.removeClass('error');
        element.next('.error-msg').removeClass('show');
        return true;
      }
    }
  
    function setPreviewPayload() {
      if ($('#postcardScreen .screen-1').css('display') === 'block') {
        console.log('screen-2 html preview should be shown');
        const description = $('.screen-1 #description').val();
        const sendDate = $('.screen-1 #sendDate').val();
        const mailingClass = $('.screen-1 #mailingClass').val();
        const frontHtmlContent = $('.html-editor-front').val();
        const backHtmlContent = $('.html-editor-back ').val();
        const size = $('.postcard-html-size input[name=\'size\']:checked').val();
        const isExpressDelivery = $('.postcard-html-express-delivery #expDelivery').is(':checked');
        
  
        previewPayload.screen = 'html';
        previewPayload.description = description;
        previewPayload.sendDate = sendDate;
        previewPayload.mailingClass = mailingClass;
        previewPayload.frontHtmlContent = frontHtmlContent;
        previewPayload.backHtmlContent = backHtmlContent;
        previewPayload.size = size;
        previewPayload.isExpressDelivery = isExpressDelivery;
  
        console.log('preiew payload: '+JSON.stringify(previewPayload));
        
  
      } else if ($('#postcardScreen .screen-2').css('display') === 'block') {
        console.log('screen-2 pdf preview should be shown');
      }
    }
  
    async function getPreviewURL () {
      try {
        const postcardResponse = await createPostcard();
        const postcardId = postcardResponse.id;
        connection.trigger('request:spinnerShow');
        setTimeout(async function() {
          const postcardDetails = await fetchPostcardDetails(postcardId);
          console.log(postcardDetails);
          console.log('postcard creation details: '+JSON.stringify(postcardDetails));
      
          const pdfUrl = postcardDetails.url;
          console.log('pdfurl: '+pdfUrl);
          
          if (pdfUrl) {
            showPdfPreview(pdfUrl);
            connection.trigger('request:spinnerHide');
          } else {
            console.error('PDF URL not found in the response.');
            $('#pdf-preview-container').html('<p>PDF URL not found.</p>');
          }
        }, 3000);
  
      } catch (error) {
        console.error('Failed to fetch postcard details:', error);
        $('#pdf-preview-container').html('<p>Failed to fetch PDF preview.</p>');
      }
    }
  
    async function createPostcard() {
      const url = 'https://api.postgrid.com/print-mail/v1/postcards';
  
      const data = new URLSearchParams({
        'to': 'contact_hGsXV82wSiv6wpta1uXf5M',
        'from': 'contact_hGsXV82wSiv6wpta1uXf5M',
        'frontHTML': previewPayload.frontHtmlContent,
        'backHTML': previewPayload.backHtmlContent,
        'size': previewPayload.size,
        'sendDate': previewPayload.sendDate,
        'express': previewPayload.isExpressDelivery,
        'description': previewPayload.description,
        'mailingClass': previewPayload.mailingClass,
        'mergeVariables[language]': 'english',
        'metadata[company]': 'PostGrid'
      });
  
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'x-api-key': previewPayload.test_api_key,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: data
        });
  
        if (!response.ok) {
          // Handle HTTP errors
          const errorResponse = await response.json();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${JSON.stringify(errorResponse.error)}`);
        }
  
        const result = await response.json();
        console.log('Postcard created successfully:', result);
        return result;
      } catch (error) {
        console.error('Error creating postcard:', error.message);
        throw error;
      }
    }
  
    async function fetchPostcardDetails(postcardId) {
      const apiUrl = `https://api.postgrid.com/print-mail/v1/postcards/${postcardId}?expand[]=frontTemplate&expand[]=backTemplate`;
      const apiKey = 'test_sk_qraE3RyxvpGQbAjQfngQbb'; 
  
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
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching postcard details:', error);
        throw error;
      }
    }
  
    function showPdfPreview(pdfUrl) {
      if (!pdfUrl) {
        console.error('PDF URL is missing.');
        return;
      }
  
      try {
          $('#pdf-preview').attr('src', pdfUrl + '#toolbar=0&navpanes=0');
      } catch (error) {
          console.log('pdf preview error: '+error);
          
      }
  
      $('#pdf-preview').on('error', function () {
        $('#pdf-preview-container').html('<p>Unable to load PDF preview.</p>');
      });
    }
  
    /** screen 3A script */
  
    /** screen 4 script */
  
    let timeoutId;
    // Function to fetch data from the API
    function fetchContacts(searchQuery) {
      $.ajax({
        url: 'https://api.postgrid.com/print-mail/v1/contacts', // Replace with your API endpoint
        method: 'GET',
        data: searchQuery ? { search: searchQuery, limit: 10 } : { limit: 10 },
        headers: {
          'x-api-key': 'test_sk_qraE3RyxvpGQbAjQfngQbb'// Replace with your API key
        },
        success: function (response) {
          // Clear existing options
          $('#dropdown-options').empty();
          console.log('Resonese here', response.data);
  
          // Populate the dropdown with new options
          response.data.forEach(function (contact) {
            $('#dropdown-options').append(
              $('<div>').text(contact.firstName).data('contact', contact)
            );
          });
  
          // Show the dropdown if there are results
          if (response.data.length > 0) {
            $('#dropdown-options').show();
          } else {
            $('#dropdown-options').hide();
          }
        },
        error: function (xhr, status, error) {
          console.error('Error fetching contacts:', error);
        }
      });
    }
  
    // Debounce function to limit API calls
    function debounce(func, delay) {
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
      };
    }
  
    // Debounced version of the fetchContacts function
    const debouncedFetchContacts = debounce(fetchContacts, 300);
  
    // Event listener for the search input
    $('#search-contact').on('input', function () {
      const searchQuery = $(this).val();
      if (searchQuery.length > 2) { // Only search if the input has more than 2 characters
        debouncedFetchContacts(searchQuery);
      } else {
        $('#dropdown-options').empty().hide();
      }
    });
  
    // Event listener for selecting a contact from the dropdown
    $('#dropdown-options').on('click', 'div', function () {
      const contact = $(this).data('contact');
      $('#search-contact').val(contact.firstName); // Set the selected contact name in the input
      $('#dropdown-options').hide(); // Hide the dropdown
  
      // You can also store the selected contact ID or other data if needed
      console.log('Selected Contact:', contact);
    });
  
    // Hide dropdown when clicking outside
    $(document).on('click', function (event) {
      if (!$(event.target).closest('.mapping-dropdown').length) {
        $('#dropdown-options').hide();
      }
    });
    // show input when 
    $('#search-contact').on('focus', function () {
      //  fetchContacts(); // Show initial contacts
      const searchQuery = $(this).val().trim();
      if ($('#dropdown-options').is(':hidden')) { // Only fetch if dropdown is hidden
        fetchContacts(searchQuery); // Use existing searchQuery if present
      }
  
    });
    // start of dropdown mapping fileds function
    function populateDropdowns() {
      $('.mapping-fields-group select').each(function () {
        let $select = $(this);
        let defaultOption = $select.find('option:first').prop('outerHTML'); // Preserve the first default option
        let currentSelection = $select.val(); // Store current selection
  
        $select.empty().append(defaultOption); // Reset options
  
        deFields.forEach((field) => {
          if (!Object.values(selectedFieldsForMapping).includes(field.name) || field.name === currentSelection) {
            $select.append($('<option></option>').attr('value', field.name).text(field.name));
          }
        });
  
        $select.val(currentSelection); // Reapply previous selection if still valid
      });
    }
  
    // Event listener for dropdown change
    $('.mapping-fields-group select').on('change', function () {
      let fieldId = $(this).attr('id');
      let selectedValue = $(this).val();
  
      // Remove previous selection
      if (selectedFieldsForMapping[fieldId]) {
        delete selectedFieldsForMapping[fieldId];
      }
  
      // Store new selection
      if (selectedValue && selectedValue !== $(this).find('option:first').val()) {
        selectedFieldsForMapping[fieldId] = selectedValue;
      }
  
      // Refresh all dropdowns
      populateDropdowns();
    });
  
    // end of mapping fields dropdown functions
  
    /* start of function for to contact mappping*/
    function validateToContact() {
      let isValid = true;
      resetToContactMappingErrors();
  
      // Validate Address Line 1
      let address1 = $('#address1').val();
      if (address1 === 'Select') {
        $('#address1').css('border', '2px solid red');
        $('.error-message-contactMapping').text('Address Line 1 is required.').css('color', 'red').show();
        isValid = false;
      }
  
      // Validate First Name or Company (one must be selected)
      let firstName = $('#first-name').val();
      let company = $('#company').val();
      if (firstName === 'Select' && company === 'Select') {
        $('#first-name, #company').css('border', '2px solid red');
        $('.error-message-contactMapping').text('Either First Name or Company must be selected.').css('color', 'red').show();
        isValid = false;
      }
  
      return isValid;
    }
    /* start of function for to contact mappping*/
    function resetToContactMappingErrors() {
      $('.mapping-fields-group select').css('border', ''); // Reset border styles
      $('.error-message-contactMapping').text('').hide(); // Clear and hide error messages
    }
    $('.mapping-fields-group select').on('click', function () {
      resetToContactMappingErrors();
    });
  
    /** screen 4 script */
  
    /** screen 3C script */
  
    function validateStep3() {
      let isValid = true;
      $('.error-message').remove();
      let today = new Date().toISOString().split('T')[0];
      $('#sendDate3').attr('min', today);
      if (!$('#description3').val().trim()) {
        $('#description3').after('<span class="error-message">Please write the description.</span>');
        isValid = false;
      }
      let selectedDate = $('#sendDate3').val();
      if (!selectedDate || selectedDate < today) {
        $('#sendDate3').after('<span class="error-message">Send Date cannot be in the past.</span>');
        isValid = false;
      }
      if (!$('#mailingClass3').val()) {
        $('#mailingClass3').after('<span class="error-message">Mailing Class is required.</span>');
        isValid = false;
      }
      if (!$('input[name=\'size\']:checked').length) {
        $('.radio-buttons').after('<span class="error-message">Please select at least one size.</span>');
        isValid = false;
      }
      // Validate Front Template
  
      if (!$('#frontTemplateInput').val()) {
        $('#frontTemplateInput').after('<span class="error-message">Please select the Front Template this is required.</span>');
        isValid = false;
      }
      if (!$('#backTemplateInput').val()) {
        $('#backTemplateInput').after('<span class="error-message">Please select the Back Template this is required.</span>');
        isValid = false;
      }
      return isValid;
    }
    //Set default date to today when the page loads
    $(document).ready(function () {
      let today = new Date().toISOString().split('T')[0];
      $('#sendDate3').val(today); // Set default value
      $('#sendDate3').attr('min', today); // Restrict past dates
  
    });
    // Fetch templates from the API
    // Debounce function to limit API calls while typing
    function lazyInvoke(func, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
    }
  
    // Global previewPayload


// Fetch templates with optional search query
async function fetchTemplates(searchQuery = '') {
    console.log('Fetching templates...');
    const requestOptions = {
        method: 'GET',
        headers: { 'x-api-key': 'test_sk_qraE3RyxvpGQbAjQfngQbb' },
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
        console.error('Error fetching templates:', error);
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
    const inputId = listId === 'frontTemplateList' ? 'frontTemplateInput' : 'backTemplateInput';
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.value = template.description || 'No description';
        inputElement.dataset.id = template.id; // Store ID for later use
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
    frontSearchInput.addEventListener('input', lazyInvoke(function (event) {
        const searchQuery = event.target.value.trim();
        fetchTemplates(searchQuery);
    }, 300)); // lazyInvoke with 300ms delay
}

if (backSearchInput) {
    backSearchInput.addEventListener('input', lazyInvoke(function (event) {
        const searchQuery = event.target.value.trim();
        fetchTemplates(searchQuery);
    }, 300)); // lazyInvoke with 300ms delay
}

// Fetch templates on page load
fetchTemplates();

/** screen 3C script */

const API_KEY = "test_sk_qraE3RyxvpGQbAjQfngQbb"; // Store API key in a single place

async function fetchPostcardDetails(postcardId) {
    const apiUrl = `https://api.postgrid.com/print-mail/v1/postcards/${postcardId}?expand[]=frontTemplate&expand[]=backTemplate`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching postcard details:', error);
        throw error;
    }
}

function showPdfPreview(pdfUrl) {
    if (!pdfUrl) {
        console.error('PDF URL is missing.');
        return;
    }

    try {
        $('#pdf-preview').attr('src', pdfUrl + '#toolbar=0&navpanes=0');
    } catch (error) {
        console.log('pdf preview error: ' + error);
    }

    $('#pdf-preview').on('error', function () {
        $('#pdf-preview-container').html('<p>Unable to load PDF preview.</p>');
    });
}

async function setPreviewPayload() {
    const description = document.querySelector('#description3').value;
    const sendDate = document.querySelector('#sendDate3').value;
    const frontTemplateId = document.querySelector('#frontTemplateInput')?.dataset.id;
    const backTemplateId = document.querySelector('#backTemplateInput')?.dataset.id;

    const sizeInputs = document.querySelectorAll('input[name="size"]');
    let selectedSize = null;
    sizeInputs.forEach(input => {
        if (input.checked) {
            selectedSize = input.id === 'six-four' ? '6x4' :
                input.id === 'nine-six' ? '9x6' :
                    input.id === 'eleven-eight' ? '11x8' : null;
        }
    });

    if (!frontTemplateId || !backTemplateId || !selectedSize) {
        console.error("Missing required fields for postcard creation.");
        return null;
    }

    return {
        description,
        sendDate,
        frontTemplateId,
        backTemplateId,
        size: selectedSize,
    };
}

async function createPostcard(previewPayload) {
    const apiUrl = "https://api.postgrid.com/print-mail/v1/postcards";

    const requestBody = new URLSearchParams({
        to: "contact_5GFnGoGySA8f9n73AToLXw",
        from: "contact_5GFnGoGySA8f9n73AToLXw",
        frontTemplate: previewPayload.frontTemplateId,
        backTemplate: previewPayload.backTemplateId,
        size: previewPayload.size,
        sendDate: previewPayload.sendDate || undefined,
        description: previewPayload.description || "Postcard created via API",
    });

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "x-api-key": API_KEY,
                "Content-Type": 'application/x-www-form-urlencoded'
            },
            body: requestBody
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorResponse)}`);
        }

        const result = await response.json();
        console.log("Postcard created successfully:", result);
        return result;
    } catch (error) {
        console.error("Error creating postcard:", error);
        throw error;
    }
}

async function getPreviewURL() {
    try {
        const previewPayload = await setPreviewPayload();
        if (!previewPayload) {
            console.error("Preview payload is missing.");
            return;
        }

        const postcardResponse = await createPostcard(previewPayload);
        const postcardId = postcardResponse.id;
        connection.trigger('request:spinnerShow');
        setTimeout(async function () {
            const postcardDetails = await fetchPostcardDetails(postcardId);
            console.log(postcardDetails);
            console.log('postcard creation details: ' + JSON.stringify(postcardDetails));

            const pdfUrl = postcardDetails.url;
            console.log('pdfurl: ' + pdfUrl);

            if (pdfUrl) {
                showPdfPreview(pdfUrl);
                connection.trigger('request:spinnerHide');
            } else {
                console.error('PDF URL not found in the response.');
                $('#pdf-preview-container').html('<p>PDF URL not found.</p>');
            }
        }, 3000);

    } catch (error) {
        console.error('Failed to fetch postcard details:', error);
        $('#pdf-preview-container').html('<p>Failed to fetch PDF preview.</p>');
    }
}
  });
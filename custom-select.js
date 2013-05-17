/* 
*	@Class:			Custom select for easier css styling
*	@Author:		Pim Hoogendoorn <pim.hoogendoorn@willenium.nl>
*	@Created:		August 2012
*	@Updated:		May 2013
*	@Description:	Creates custom select from <select> for fancy styling
*	@Todo:			Support for <optgroup> - Touch support
*	@Usage:			This:
					<select>
						<option selected="selected">Foo</option>
						<option>Bar</option>
					</select>
*
*					Becomes this:
					<div class="custom-select-overlay">
						<button id="trigger" class="trigger">Foo</button>
						<ul class="options">
							<li class="selected">
								<button data-value="Foo" tabindex="-1">Foo</button>
							</li>
							<li>
								<button data-value="Bar" tabindex="-1">Bar</button>
							</li>
						</ul>
					</div>
*					If you would do this:
					$('select').CustomSelect();
---------------------------------------------------------------------------- */

(function ($)
{
	'use strict';

	var defaults = {
		replacedClass: 'replaced',
		wrapperClass: 'custom-select',
		triggerClass: 'trigger',
		selectedClass: 'selected',
		disabledClass: 'disabled',
		focusClass: 'focus',
		optionsClass: 'options',
		optionClass: 'option',
		expandedClass: 'expanded'
	};

	var CustomSelect = function (element, opts)
	{
		var selectElement	= $(element),
			options			= $.extend({}, defaults, opts),
			selectOptions	= selectElement.children(),
			disabled		= selectElement.attr('disabled') ? true : false,
			trigger			= $('<button id="trigger" class="' + options.triggerClass + '"></button>'),
			wrapper			= $('<div class="' + options.wrapperClass + '"></div>'),
			list			= $('<ul class="' + options.optionsClass + '"></ul>'),
			listOfOptions	= [],
			expanded		= false,
			selectedEl		= '.' + options.selectedClass,
			optionEl		= '.' + options.optionClass,

		init = function()
		{
			// Add class for styling purposes
			selectElement.addClass(options.replacedClass);

			// Create the element(s)
			createCustomSelect();

			// Bind event handlers
			bindEventHandler();
		},

		/**
		* Bind event handlers to the custom select
		*/
		bindEventHandler = function()
		{
			// Open & close options on mouse event
			trigger.on('click', toggleCustomSelect);
			list.on('click', handleCustomListClick);

			// Open & close options on keyboard event
			selectElement.on('focus blur keyup disable', handleKeyboardSelect);
			wrapper.on('focus blur keyup disable', handleKeyboardSelect);
		},

		/**
		* Handle keyboard events on the original <select>
		* @param {object} jQuery event
		*/
		handleKeyboardSelect = function(e)
		{
			if(disabled)
			{
				return false;
			}

			switch(e.type)
			{
				case 'keyup':
					handleKeyboardInput(e);
				break;
				case 'blur':
					wrapper.removeClass(options.focusClass);
				break;
				case 'focus':
					wrapper.addClass(options.focusClass);
				break;
				case 'disable':
					disabled = true;
					break;
				default:
			}

			e.preventDefault();
		},

		/**
		* Handle the keyboard input event
		* @param {object} jQuery event
		*/
		handleKeyboardInput = function(e)
		{
			var selection = list.find(selectedEl).index(),
				nextSelection = null;

			// INPUT
			if(e.keyCode === 38 || e.keyCode === 37) // UP/LEFT
			{
				nextSelection = list.find('li').eq(selection).prev('li');
			}
			else if(e.keyCode === 40 || e.keyCode === 39) // DOWN/RIGHT
			{
				nextSelection = list.find('li').eq(selection).next('li');
			}

			// SELECT NEXT ITEM
			if(nextSelection && nextSelection.length > 0)
			{
				nextSelection.addClass(options.selectedClass);
				updateTriggerText(nextSelection.text());
				list.find('li').eq(selection).removeClass(options.selectedClass);
				changeSelectItem(list.find(selectedEl).find(optionEl));
			}
		},

		/**
		* Handle click on custom select element
		* @param {object} jQuery event
		*/
		handleCustomListClick = function(e)
		{
			if(disabled)
			{
				return false;
			}

			var target = $(e.target);

			if(target.is('button'))
			{
				toggleCustomSelect();
				changeSelectElement(target);
			}

			e.preventDefault();
		},

		/**
		* Change selection in both select elements (custom & original <select>)
		* @param {object} selection
		*/
		changeSelectElement = function(selection)
		{
			var currentSelection = selection;
			list.find(optionEl).parent().removeClass(options.selectedClass);// Deselect current selected
			currentSelection.parent().addClass(options.selectedClass); // Make new selection
			updateTriggerText(currentSelection.text()); // Set selection text

			// Select the right option in original <select>
			changeSelectItem(selection);
		},

		/**
		* Select the correct option in original <select>
		* @param {object} selection
		*/
		changeSelectItem = function(selection)
		{
			var value = $(selection).data('value');
			selectElement.find('option').attr('selected', false);
			selectElement.find('[value=' + value + ']').attr('selected', true);
			selectElement.val(value);
		},

		/**
		* Show/hide the options of the custom select element
		*/
		toggleCustomSelect = function()
		{
			if(disabled)
			{
				return false;
			}

			if(expanded)
			{
				closeCustomSelect();
			}
			else
			{
				openCustomSelect();
			}
		},

		/**
		* Show options
		*/
		openCustomSelect = function()
		{
			// Fire focus event on replaced <select>
			// selectElement.focus();
			wrapper.addClass(options.expandedClass);
			expanded = true;
		},

		/**
		* Hide options
		*/
		closeCustomSelect = function()
		{
			// Fire blur event on replaced <select>
			// selectElement.blur();
			wrapper.removeClass(options.expandedClass);
			expanded = false;
		},

		/**
		* Create a custom select element from the original <select> element
		*/
		createCustomSelect = function()
		{
			if(disabled)
			{
				wrapper.addClass(options.disabledClass);
			}

			// Create list item from each <option>
			$.each(selectOptions, function(key, val)
			{
				var item = $(val), optgroup = null, listItem = null;

				// Set specials for selected option
				listItem = $('<li><button class="' + options.optionClass + '" data-value="' + item.val() + '" tabindex="-1">' + item.text() + '</button></li>');

				if(item.attr('selected') === 'selected')
				{
					updateTriggerText(item.text());
					listItem.addClass(options.selectedClass);
				}

				// Add element to options array
				listOfOptions.push(listItem[0]);

				// Add custom select element to dom
				trigger.appendTo(wrapper);
				list.append(listOfOptions).appendTo(wrapper);
				selectElement.after(wrapper);
			});
		},

		/**
		* Show correct selection in custom trigger
		* @param {string} text value
		*/
		updateTriggerText = function(value)
		{
			trigger.text(value);
		};

		// Execute
		init();
	};

	/*
	* @jQuery wrapper around plugin.
	*/
	$.fn.CustomSelect = function (options)
	{
		return this.each(function ()
		{
			var settings = $.extend({}, options, $(this).data());
			return (new CustomSelect(this, settings));
		});
	};

} (jQuery || {}));
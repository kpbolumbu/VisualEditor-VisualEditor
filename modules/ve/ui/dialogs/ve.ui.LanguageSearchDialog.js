/*!
 * VisualEditor UserInterface LanguageSearchDialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Language search dialog
 *
 * @class
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.LanguageSearchDialog = function VeUiLanguageSearchDialog( config ) {
	// Configuration initialization
	config = ve.extendObject( { 'footless': true, 'size': 'medium' }, config );

	// Parent constructor
	ve.ui.Dialog.call( this, config );

	// Events
	this.connect( this, { 'ready': 'onReady' } );
};

/* Inheritance */

OO.inheritClass( ve.ui.LanguageSearchDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.LanguageSearchDialog.static.name = 'languageSearch';

ve.ui.LanguageSearchDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-dialog-language-search-title' );

ve.ui.LanguageSearchDialog.static.icon = 'language';

/**
 * Language search widget class to use.
 *
 * @static
 * @property {Function}
 * @inheritable
 */
ve.ui.LanguageSearchDialog.static.languageSearchWidget = ve.ui.LanguageSearchWidget;

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.LanguageSearchDialog.prototype.initialize = function () {
	ve.ui.Dialog.prototype.initialize.apply( this, arguments );

	this.searchWidget = new this.constructor.static.languageSearchWidget( {
			'$': this.$
		} ).on( 'select', ve.bind( this.onSearchWidgetSelect, this ) );
	this.$body.append( this.searchWidget.$element );
};

/**
 * Handle the search widget being selected
 *
 * @param {Object} data Data from the selected option widget
 */
ve.ui.LanguageSearchDialog.prototype.onSearchWidgetSelect = function ( data ) {
	this.close( {
		'action': 'apply',
		'lang': data.code,
		'dir': $.uls.data.getDir( data.code )
	} );
};

/**
 * @inheritdoc
 */
ve.ui.LanguageSearchDialog.prototype.setup = function () {
	ve.ui.Dialog.prototype.setup.apply( this, arguments );

	this.searchWidget.addResults();
};

/**
 * Handle window ready events
 */
ve.ui.LanguageSearchDialog.prototype.onReady = function () {
	this.searchWidget.getQuery().focus();
};

/**
 * @inheritdoc
 */
ve.ui.LanguageSearchDialog.prototype.teardown = function () {
	ve.ui.Dialog.prototype.teardown.apply( this, arguments );

	this.searchWidget.getQuery().setValue( '' );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.LanguageSearchDialog );

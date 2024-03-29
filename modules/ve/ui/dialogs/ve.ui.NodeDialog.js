/*!
 * VisualEditor user interface NodeDialog class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog associated with a node.
 *
 * @class
 * @extends ve.ui.ActionDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.NodeDialog = function VeUiNodeDialog( config ) {
	// Parent constructor
	ve.ui.ActionDialog.call( this, config );

	// Properties
	this.selectedNode = null;
};

/* Inheritance */

OO.inheritClass( ve.ui.NodeDialog, ve.ui.ActionDialog );

/* Static Properties */

/**
 * Node classes compatible with this dialog.
 *
 * @static
 * @property {Function}
 * @inheritable
 */
ve.ui.NodeDialog.static.modelClasses = [];

/* Methods */

/**
 * Get the selected node.
 *
 * Should only be called after setup and before teardown.
 * If no node is selected or the selected node is incompatible, null will be returned.
 *
 * @param {Object} [data] Dialog opening data
 * @return {ve.dm.Node} Selected node
 */
ve.ui.NodeDialog.prototype.getSelectedNode = function () {
	var i, len,
		modelClasses = this.constructor.static.modelClasses,
		selectedNode = this.getFragment().getSelectedNode();

	for ( i = 0, len = modelClasses.length; i < len; i++ ) {
		if ( selectedNode instanceof modelClasses[i] ) {
			return selectedNode;
		}
	}
	return null;
};

/**
 * @inheritdoc
 */
ve.ui.NodeDialog.prototype.initialize = function ( data ) {
	// Parent method
	ve.ui.NodeDialog.super.prototype.initialize.call( this, data );

	// Initialization
	this.frame.$content.addClass( 've-ui-nodeDialog' );
};

/**
 * @inheritdoc
 */
ve.ui.NodeDialog.prototype.setup = function ( data ) {
	// Properties
	this.selectedNode = this.getSelectedNode( data );

	// Parent method
	ve.ui.NodeDialog.super.prototype.setup.call( this, data );
};

/**
 * @inheritdoc
 */
ve.ui.NodeDialog.prototype.teardown = function ( data ) {
	// Parent method
	ve.ui.NodeDialog.super.prototype.teardown.call( this, data );

	// Properties
	this.selectedNode = null;
};

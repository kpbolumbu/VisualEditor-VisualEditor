/*!
 * VisualEditor ContentEditable Surface tests.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

QUnit.module( 've.ce.Surface' );

/* Tests */

ve.test.utils.runSurfaceHandleSpecialKeyTest = function ( assert, html, range, operations, expectedData, expectedRange, msg ) {
	var i, method, args,
		selection,
		actions = {
			'backspace': [ 'handleDelete', {}, true ],
			'delete': [ 'handleDelete', {}, false ],
			'modifiedBackspace': [ 'handleDelete', { 'ctrlKey': true }, true ],
			'modifiedDelete': [ 'handleDelete', { 'ctrlKey': true }, false ],
			'enter': [ 'handleEnter', {}, true ],
			'modifiedEnter': [ 'handleEnter', { 'shiftKey': true }, false ]
		},
		surface = ve.test.utils.createSurfaceFromHtml( html || ve.dm.example.html ),
		view = surface.getView(),
		model = surface.getModel(),
		data = ve.copy( model.getDocument().getFullData() );

	// TODO: model.getSelection() should be consistent after it has been
	// changed but appears to behave differently depending on the browser.
	// The selection from the select event is still consistent.
	selection = range;
	model.on( 'select', function ( s ) {
		selection = s;
	} );

	model.setSelection( range );
	for ( i = 0; i < operations.length; i++ ) {
		method = actions[operations[i]][0];
		args = actions[operations[i]].slice( 1 );
		view[method].apply( view, args );
	}
	expectedData( data );

	assert.deepEqualWithDomElements( model.getDocument().getFullData(), data, msg + ': data' );
	assert.deepEqual( selection, expectedRange, msg + ': range' );
	surface.destroy();
};

QUnit.test( 'handleDelete', function ( assert ) {
	var i,
		cases = [
			{
				'range': new ve.Range( 2 ),
				'operations': ['backspace'],
				'expectedData': function ( data ) {
					data.splice( 1, 1 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Character deleted by backspace'
			},
			{
				'range': new ve.Range( 2 ),
				'operations': ['delete'],
				'expectedData': function ( data ) {
					data.splice( 2, 1 );
				},
				'expectedRange': new ve.Range( 2 ),
				'msg': 'Character deleted by delete'
			},
			{
				'range': new ve.Range( 1, 4 ),
				'operations': ['backspace'],
				'expectedData': function ( data ) {
					data.splice( 1, 3 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Selection deleted by backspace'
			},
			{
				'range': new ve.Range( 1, 4 ),
				'operations': ['delete'],
				'expectedData': function ( data ) {
					data.splice( 1, 3 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Selection deleted by delete'
			},
			{
				'range': new ve.Range( 4 ),
				'operations': ['modifiedBackspace'],
				'expectedData': function ( data ) {
					data.splice( 1, 3 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Whole word deleted by modified backspace'
			},
			{
				'range': new ve.Range( 1 ),
				'operations': ['modifiedDelete'],
				'expectedData': function ( data ) {
					data.splice( 1, 3 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Whole word deleted by modified delete'
			},
			{
				'range': new ve.Range( 1, 4 ),
				'operations': ['delete', 'delete'],
				'expectedData': function ( data ) {
					data.splice( 0, 5 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Empty node deleted by delete'
			},
			{
				'range': new ve.Range( 41 ),
				'operations': ['backspace'],
				'expectedData': function () {},
				'expectedRange': new ve.Range( 39, 41 ),
				'msg': 'Focusable node selected but not deleted by backspace'
			},
			{
				'range': new ve.Range( 39 ),
				'operations': ['delete'],
				'expectedData': function () {},
				'expectedRange': new ve.Range( 39, 41 ),
				'msg': 'Focusable node selected but not deleted by delete'
			},
			{
				'range': new ve.Range( 39, 41 ),
				'operations': ['delete'],
				'expectedData': function ( data ) {
					data.splice( 39, 2 );
				},
				'expectedRange': new ve.Range( 39 ),
				'msg': 'Focusable node deleted if selected first'
			}
		];

	QUnit.expect( cases.length * 2 );

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfaceHandleSpecialKeyTest(
			assert, cases[i].html, cases[i].range, cases[i].operations,
			cases[i].expectedData, cases[i].expectedRange, cases[i].msg
		);
	}
} );

QUnit.test( 'handleEnter', function ( assert ) {
	var i,
		emptyList = '<ul><li><p></p></li></ul>',
		cases = [
			{
				'range': new ve.Range( 57 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						57, 0,
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' }
					);
				},
				'expectedRange': new ve.Range( 59 ),
				'msg': 'End of paragraph split by enter'
			},
			{
				'range': new ve.Range( 57 ),
				'operations': ['modifiedEnter'],
				'expectedData': function ( data ) {
					data.splice(
						57, 0,
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' }
					);
				},
				'expectedRange': new ve.Range( 59 ),
				'msg': 'End of paragraph split by modified enter'
			},
			{
				'range': new ve.Range( 56 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						56, 0,
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' }
					);
				},
				'expectedRange': new ve.Range( 58 ),
				'msg': 'Start of paragraph split by enter'
			},
			{
				'range': new ve.Range( 3 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						3, 0,
						{ 'type': '/heading' },
						{ 'type': 'heading', 'attributes': { 'level': 1 } }
					);
				},
				'expectedRange': new ve.Range( 5 ),
				'msg': 'Heading split by enter'
			},
			{
				'range': new ve.Range( 2, 3 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						2, 1,
						{ 'type': '/heading' },
						{ 'type': 'heading', 'attributes': { 'level': 1 } }
					);
				},
				'expectedRange': new ve.Range( 4 ),
				'msg': 'Selection in heading removed, then split by enter'
			},
			{
				'range': new ve.Range( 1 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						0, 0,
						{ 'type': 'paragraph' },
						{ 'type': '/paragraph' }
					);
				},
				'expectedRange': new ve.Range( 3 ),
				'msg': 'Start of heading split into a plain paragraph'
			},
			{
				'range': new ve.Range( 4 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						5, 0,
						{ 'type': 'paragraph' },
						{ 'type': '/paragraph' }
					);
				},
				'expectedRange': new ve.Range( 6 ),
				'msg': 'End of heading split into a plain paragraph'
			},
			{
				'range': new ve.Range( 16 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						16, 0,
						{ 'type': '/paragraph' },
						{ 'type': '/listItem' },
						{ 'type': 'listItem' },
						{ 'type': 'paragraph' }
					);
				},
				'expectedRange': new ve.Range( 20 ),
				'msg': 'List item split by enter'
			},
			{
				'range': new ve.Range( 16 ),
				'operations': ['modifiedEnter'],
				'expectedData': function ( data ) {
					data.splice(
						16, 0,
						{ 'type': '/paragraph' },
						{ 'type': 'paragraph' }
					);
				},
				'expectedRange': new ve.Range( 18 ),
				'msg': 'List item not split by modified enter'
			},
			{
				'range': new ve.Range( 21 ),
				'operations': ['enter', 'enter'],
				'expectedData': function ( data ) {
					data.splice(
						24, 0,
						{ 'type': 'paragraph' },
						{ 'type': '/paragraph' }
					);
				},
				'expectedRange': new ve.Range( 25 ),
				'msg': 'Two enters breaks out of a list and starts a new paragraph'
			},
			{
				'html': '<p>foo</p>' + emptyList + '<p>bar</p>',
				'range': new ve.Range( 8 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice( 5, 6 );
				},
				'expectedRange': new ve.Range( 6 ),
				'msg': 'Enter in an empty list destroys it and moves to next paragraph'
			},
			{
				'html': '<p>foo</p>' + emptyList,
				'range': new ve.Range( 8 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice( 5, 6 );
				},
				'expectedRange': new ve.Range( 4 ),
				'msg': 'Enter in an empty list at end of document destroys it and moves to previous paragraph'
			},
			{
				'html': emptyList + '<p>bar</p>',
				'range': new ve.Range( 3 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice( 0, 6 );
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Enter in an empty list at start of document destroys it and moves to next paragraph'
			},
			{
				'html': emptyList,
				'range': new ve.Range( 3 ),
				'operations': ['enter'],
				'expectedData': function ( data ) {
					data.splice(
						0, 6,
						{ 'type': 'paragraph' },
						{ 'type': '/paragraph' }
					);
				},
				'expectedRange': new ve.Range( 1 ),
				'msg': 'Enter in an empty list with no adjacent content destroys it and creates a paragraph'
			}
		];

	QUnit.expect( cases.length * 2 );

	for ( i = 0; i < cases.length; i++ ) {
		ve.test.utils.runSurfaceHandleSpecialKeyTest(
			assert, cases[i].html, cases[i].range, cases[i].operations,
			cases[i].expectedData, cases[i].expectedRange, cases[i].msg
		);
	}
} );

QUnit.test( 'onContentChange', function ( assert ) {
	var i,
		cases = [
			{
				'prevHtml': '<p></p>',
				'prevRange': new ve.Range( 1 ),
				'nextHtml': '<p>A</p>',
				'nextRange': new ve.Range( 2 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 1 },
						{
							'type': 'replace',
							'insert': [ 'A' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 3 }
					]
				],
				'msg': 'Simple insertion into empty paragraph'
			},
			{
				'prevHtml': '<p>A</p>',
				'prevRange': new ve.Range( 1, 2 ),
				'nextHtml': '<p>B</p>',
				'nextRange': new ve.Range( 2 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 1 },
						{
							'type': 'replace',
							'insert': [ 'B' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 4 }
					],
					[
						{ 'type': 'retain', 'length': 2 },
						{
							'type': 'replace',
							'insert': [],
							'remove': [ 'A' ]
						},
						{ 'type': 'retain', 'length': 3 }
					]
				],
				'msg': 'Simple replace'
			},
			{
				'prevHtml': '<p><a href="Foo">A</a><a href="Bar">FooX?</a></p>',
				'prevRange': new ve.Range( 5, 6 ),
				'nextHtml': '<p><a href="Foo">A</a><a href="Bar">FooB?</a></p>',
				'nextRange': new ve.Range( 6 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 5 },
						{
							'type': 'replace',
							'insert': [ ['B', [1]] ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					],
					[
						{ 'type': 'retain', 'length': 6 },
						{
							'type': 'replace',
							'insert': [],
							'remove': [ ['X', [1]] ]
						},
						{ 'type': 'retain', 'length': 4 }
					]
				],
				'msg': 'Replace into non-zero annotation next to word break'
			}
		];

	QUnit.expect( cases.length * 2 );

	function testRunner( prevHtml, prevRange, nextHtml, nextRange, expectedOps, expectedRange, msg ) {
		var txs, i, ops,
			surface = ve.test.utils.createSurfaceFromHtml( prevHtml ),
			view = surface.getView().getDocument().getDocumentNode().children[0],
			prevNode = $( prevHtml )[0],
			nextNode = $( nextHtml )[0],
			prev = {
				'text': ve.ce.getDomText( prevNode ),
				'hash': ve.ce.getDomHash( prevNode ),
				'range': prevRange
			},
			next = {
				'text': ve.ce.getDomText( nextNode ),
				'hash': ve.ce.getDomHash( nextNode ),
				'range': nextRange
			};

		surface.getView().onContentChange( view, prev, next );
		txs = surface.getModel().getHistory()[0].transactions;
		ops = [];
		for ( i = 0; i < txs.length; i++ ) {
			ops.push( txs[i].getOperations() );
		}
		assert.deepEqual( ops, expectedOps, msg + ': operations' );
		assert.deepEqual( surface.getModel().getSelection(), expectedRange, msg + ': range' );

		surface.destroy();
	}

	for ( i = 0; i < cases.length; i++ ) {
		testRunner(
			cases[i].prevHtml, cases[i].prevRange, cases[i].nextHtml, cases[i].nextRange,
			cases[i].expectedOps, cases[i].expectedRange || cases[i].nextRange, cases[i].msg
		);
	}

} );

QUnit.test( 'getClipboardHash', 1, function ( assert ) {
	assert.equal(
		ve.ce.Surface.static.getClipboardHash(
			$( $.parseHTML( '  <p class="foo"> Bar </p>\n\t<span class="baz"></span> Quux <h1><span></span>Whee</h1>' ) )
		),
		'Bar<SPAN>QuuxWhee',
		'Simple usage'
	);
} );

QUnit.test( 'onCopy', function ( assert ) {
	var i, testClipboardData,
		testEvent = {
			'originalEvent': {
				'clipboardData': {
					'setData': function ( prop, val ) {
						testClipboardData[prop] = val;
						return true;
					}
				}
			},
			'preventDefault': function () {}
		},
		cases = [
			{
				'range': new ve.Range( 27, 32 ),
				'expectedData': [
					{ 'type': 'list', 'attributes': { 'style': 'number' } },
					{ 'type': 'listItem' },
					{ 'type': 'paragraph' },
					'g',
					{ 'type': '/paragraph' },
					{ 'type': '/listItem' },
					{ 'type': '/list' },
					{ 'type': 'internalList' },
					{ 'type': '/internalList' }
				],
				'expectedOriginalRange': new ve.Range( 1, 6 ),
				'expectedBalancedRange': new ve.Range( 1, 6 ),
				'msg': 'Copy list item'
			}
		];

	QUnit.expect( cases.length * 4 );

	function testRunner( doc, range, expectedData, expectedOriginalRange, expectedBalancedRange, msg ) {
		var clipboardKey, parts, clipboardIndex, slice,
			surface = ve.test.utils.createSurfaceFromDocument(
				doc || ve.dm.example.createExampleDocument()
			),
			view = surface.getView(),
			model = surface.getModel();

		// Paste sequence
		model.setSelection( range );
		testClipboardData = {};
		view.onCopy( testEvent );

		clipboardKey = testClipboardData['text/xcustom'];

		assert.equal( clipboardKey, view.clipboardId + '-0', msg + ': clipboardId set' );

		parts = clipboardKey.split( '-' );
		clipboardIndex = parts[1];
		slice = view.clipboard[clipboardIndex].slice;

		assert.deepEqual( slice.data.data, expectedData, msg + ': data' );
		assert.deepEqual( slice.originalRange, expectedOriginalRange, msg + ': originalRange' );
		assert.deepEqual( slice.balancedRange, expectedBalancedRange, msg + ': balancedRange' );

		surface.destroy();
	}

	for ( i = 0; i < cases.length; i++ ) {
		testRunner(
			cases[i].doc, cases[i].range, cases[i].expectedData,
			cases[i].expectedOriginalRange, cases[i].expectedBalancedRange, cases[i].msg
		);
	}

} );

QUnit.test( 'beforePaste/afterPaste', function ( assert ) {
	var i, exampleDoc = '<p></p><p>Foo</p>',
		TestEvent = function ( data ) {
			this.originalEvent = {
				'clipboardData': {
					'getData': function ( prop ) {
						return data[prop];
					}
				}
			};
			this.preventDefault = function () {};
		},
		cases = [
			{
				'range': new ve.Range( 1 ),
				'pasteTargetHtml': 'Foo',
				'expectedRange': new ve.Range( 4 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 1 },
						{
							'type': 'replace',
							'insert': [
								'F', 'o', 'o',
							],
							'remove': []
						},
						{ 'type': 'retain', 'length': 8 }
					]
				],
				'msg': 'Text into empty paragraph'
			},
			{
				'range': new ve.Range( 4 ),
				'pasteTargetHtml': 'Bar',
				'expectedRange': new ve.Range( 7 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 4 },
						{
							'type': 'replace',
							'insert': [ 'B', 'a', 'r' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					]
				],
				'msg': 'Text into paragraph'
			},
			{
				'range': new ve.Range( 4 ),
				'pasteTargetHtml': '<cite>Foo</cite><b>B</b>a<!-- comment --><b>r</b>',
				'expectedRange': new ve.Range( 7 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 4 },
						{
							'type': 'replace',
							'insert': [ ['B', [0]], 'a', ['r', [0]] ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					]
				],
				'msg': 'Formatted text into paragraph'
			},
			{
				'range': new ve.Range( 4 ),
				'pasteTargetHtml': '<cite>Foo</cite><b>B</b>a<!-- comment --><b>r</b>',
				'pasteSpecial': true,
				'expectedRange': new ve.Range( 7 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 4 },
						{
							'type': 'replace',
							'insert': [ 'B', 'a', 'r' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					]
				],
				'msg': 'Formatted text into paragraph with pasteSpecial'
			},
			{
				'range': new ve.Range( 4 ),
				'pasteTargetHtml': '<p>Bar</p>',
				'expectedRange': new ve.Range( 7 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 4 },
						{
							'type': 'replace',
							'insert': [ 'B', 'a', 'r' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					]
				],
				'msg': 'Paragraph into paragraph'
			},
			{
				'range': new ve.Range( 6 ),
				'pasteTargetHtml': '<p>Bar</p>',
				'expectedRange': new ve.Range( 9 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 6 },
						{
							'type': 'replace',
							'insert': [ 'B', 'a', 'r' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 3 }
					]
				],
				'msg': 'Paragraph at end of paragraph'
			},
			{
				'range': new ve.Range( 3 ),
				'pasteTargetHtml': '<p>Bar</p>',
				'expectedRange': new ve.Range( 6 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 3 },
						{
							'type': 'replace',
							'insert': [ 'B', 'a', 'r' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 6 }
					]
				],
				'msg': 'Paragraph at start of paragraph'
			},
			{
				'range': new ve.Range( 4 ),
				'pasteTargetHtml': '☂foo☀',
				'expectedRange': new ve.Range( 9 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 4 },
						{
							'type': 'replace',
							'insert': [ '☂', 'f', 'o', 'o', '☀' ],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					]
				],
				'msg': 'Left/right placeholder characters'
			},
			{
				'range': new ve.Range( 6 ),
				'pasteTargetHtml': '<ul><li>Foo</li></ul>',
				'expectedRange': new ve.Range( 6 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 7 },
						{
							'type': 'replace',
							'insert': [
								{ 'type': 'list', 'attributes': { 'style': 'bullet' } },
								{ 'type': 'listItem' },
								{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
								'F', 'o', 'o',
								{ 'type': '/paragraph' },
								{ 'type': '/listItem' },
								{ 'type': '/list' }
							],
							'remove': []
						},
						{ 'type': 'retain', 'length': 2 }
					]
				],
				'msg': 'List at end of paragraph (moves insertion point)'
			},
			{
				'range': new ve.Range( 4 ),
				'pasteTargetHtml': '<table><caption>Foo</caption><tr><td>Bar</td></tr></table>',
				'expectedRange': new ve.Range( 26 ),
				'expectedOps': [
					[
						{ 'type': 'retain', 'length': 4 },
						{
							'type': 'replace',
							'insert': [
								{ 'type': '/paragraph' },
								{ 'type': 'table' },
								{ 'type': 'tableCaption' },
								{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
								'F', 'o', 'o',
								{ 'type': '/paragraph' },
								{ 'type': '/tableCaption' },
								{ 'type': 'tableSection', 'attributes': { 'style': 'body' } },
								{ 'type': 'tableRow' },
								{ 'type': 'tableCell', 'attributes': { 'style': 'data' } },
								{ 'type': 'paragraph', 'internal': { 'generated': 'wrapper' } },
								'B', 'a', 'r',
								{ 'type': '/paragraph' },
								{ 'type': '/tableCell' },
								{ 'type': '/tableRow' },
								{ 'type': '/tableSection' },
								{ 'type': '/table' },
								{ 'type': 'paragraph' },
							],
							'remove': []
						},
						{ 'type': 'retain', 'length': 5 }
					]
				],
				'msg': 'Table with caption into paragraph'
			}
		];

	QUnit.expect( cases.length * 2 );

	function testRunner( documentHtml, pasteTargetHtml, clipboardHtml, range, expectedOps, pasteSpecial, expectedRange, msg ) {
		var i, txs, ops,
			surface = ve.test.utils.createSurfaceFromHtml( documentHtml || exampleDoc ),
			view = surface.getView(),
			model = surface.getModel();

		// Paste sequence
		model.setSelection( range );
		view.pasteSpecial = pasteSpecial;
		if ( pasteTargetHtml ) {
			view.beforePaste( { 'originalEvent': {} } );
			document.execCommand( 'insertHTML', false, pasteTargetHtml ) ;
		} else {
			view.beforePaste( new TestEvent( { 'text/xcustom': '0.123-0', 'text/html': clipboardHtml } ) );
		}
		view.afterPaste();

		txs = model.getHistory()[0].transactions;
		ops = [];
		for ( i = 0; i < txs.length; i++ ) {
			ops.push( txs[i].getOperations() );
		}
		assert.deepEqual( ops, expectedOps, msg + ': operations' );
		assert.deepEqual( model.getSelection(), expectedRange, msg +  ': range' );

		surface.destroy();
	}

	for ( i = 0; i < cases.length; i++ ) {
		testRunner(
			cases[i].documentHtml, cases[i].pasteTargetHtml, cases[i].clipboardHtml,
			cases[i].range, cases[i].expectedOps, cases[i].pasteSpecial, cases[i].expectedRange, cases[i].msg
		);
	}

} );

/* Methods with return values */
// TODO: ve.ce.Surface#hasSlugAtOffset
// TODO: ve.ce.Surface#getClickCount
// TODO: ve.ce.Surface#needsPawn
// TODO: ve.ce.Surface#getSurface
// TODO: ve.ce.Surface#getModel
// TODO: ve.ce.Surface#getDocument
// TODO: ve.ce.Surface#getFocusedNode
// TODO: ve.ce.Surface#isRenderingLocked
// TODO: ve.ce.Surface#getDir

/* Methods without return values */
// TODO: ve.ce.Surface#getSelectionRect
// TODO: ve.ce.Surface#initialize
// TODO: ve.ce.Surface#enable
// TODO: ve.ce.Surface#disable
// TODO: ve.ce.Surface#destroy
// TODO: ve.ce.Surface#focus
// TODO: ve.ce.Surface#documentOnFocus
// TODO: ve.ce.Surface#documentOnBlur
// TODO: ve.ce.Surface#onDocumentMouseDown
// TODO: ve.ce.Surface#onDocumentMouseUp
// TODO: ve.ce.Surface#onDocumentMouseMove
// TODO: ve.ce.Surface#onDocumentDragOver
// TODO: ve.ce.Surface#onDocumentDrop
// TODO: ve.ce.Surface#onDocumentKeyDown
// TODO: ve.ce.Surface#onDocumentKeyPress
// TODO: ve.ce.Surface#afterDocumentKeyPress
// TODO: ve.ce.Surface#onDocumentKeyUp
// TODO: ve.ce.Surface#onCut
// TODO: ve.ce.Surface#onCopy
// TODO: ve.ce.Surface#onPaste
// TODO: ve.ce.Surface#onDocumentCompositionEnd
// TODO: ve.ce.Surface#onChange
// TODO: ve.ce.Surface#onSelectionChange
// TODO: ve.ce.Surface#onLock
// TODO: ve.ce.Surface#onUnlock
// TODO: ve.ce.Surface#startRelocation
// TODO: ve.ce.Surface#endRelocation
// TODO: ve.ce.Surface#handleLeftOrRightArrowKey
// TODO: ve.ce.Surface#handleUpOrDownArrowKey
// TODO: ve.ce.Surface#handleInsertion
// TODO: ve.ce.Surface#showSelection
// TODO: ve.ce.Surface#replacePhantoms
// TODO: ve.ce.Surface#replaceHighlight
// TODO: ve.ce.Surface#getNearestCorrectOffset
// TODO: ve.ce.Surface#incRenderLock
// TODO: ve.ce.Surface#decRenderLock

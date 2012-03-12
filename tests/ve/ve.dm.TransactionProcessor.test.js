module( 've/dm' );

test( 've.dm.TransactionProcessor', 79, function() {
	var documentModel = ve.dm.DocumentNode.newFromPlainObject( veTest.obj );

	// FIXME: These tests shouldn't use prepareFoo() because those functions
	// normalize the transactions they create and are tested separately.
	// We should be creating transactions directly and feeding those into
	// commit()/rollback() --Roan
	var elementAttributeChange = documentModel.prepareElementAttributeChange(
		0, 'test', 1
	);

	// Test 1
	ve.dm.TransactionProcessor.commit( documentModel, elementAttributeChange );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph', 'attributes': { 'test': 1 } },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'commit applies an element attribute change transaction to the content'
	);

	// Test 2
	ve.dm.TransactionProcessor.rollback( documentModel, elementAttributeChange );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of an element attribute change transaction on the content'
	);

	var contentAnnotation = documentModel.prepareContentAnnotation(
		new ve.Range( 1, 4 ), 'set', { 'type': 'textStyle/bold' }
	);

	// Test 3
	ve.dm.TransactionProcessor.commit( documentModel, contentAnnotation );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			['a', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			[
				'c',
				{ 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' },
				{ 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }
			],
			{ 'type': '/paragraph' }
		],
		'commit applies a content annotation transaction to the content'
	);

	// Test 4
	ve.dm.TransactionProcessor.rollback( documentModel, contentAnnotation );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of a content annotation transaction on the content'
	);

	var insertion = documentModel.prepareInsertion( 3, ['d'] );

	// Test 5
	ve.dm.TransactionProcessor.commit( documentModel, insertion );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 6 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			'd',
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'commit applies an insertion transaction to the content'
	);

	// Test 6
	deepEqual(
		documentModel.getChildren()[0].getContentData(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			'd',
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'commit keeps model tree up to date with insertions'
	);

	// Test 7
	ve.dm.TransactionProcessor.rollback( documentModel, insertion );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of an insertion transaction on the content'
	);

	// Test 8
	deepEqual(
		documentModel.getChildren()[0].getContentData(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'rollback keeps model tree up to date with insertions'
	);

	var removal = documentModel.prepareRemoval( new ve.Range( 2, 4 ) );

	// Test 9
	ve.dm.TransactionProcessor.commit( documentModel, removal );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 3 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			{ 'type': '/paragraph' }
		],
		'commit applies a removal transaction to the content'
	);

	// Test 10
	deepEqual(
		documentModel.getChildren()[0].getContentData(),
		['a'],
		'commit keeps model tree up to date with removals'
	);

	// Test 11
	ve.dm.TransactionProcessor.rollback( documentModel, removal );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of a removal transaction on the content'
	);

	// Test 12
	deepEqual(
		documentModel.getChildren()[0].getContentData(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'rollback keeps model tree up to date with removals'
	);
	
	var paragraphBreak = documentModel.prepareInsertion(
		2, [{ 'type': '/paragraph' }, { 'type': 'paragraph' }]
	);
	
	// Test 13
	ve.dm.TransactionProcessor.commit( documentModel, paragraphBreak );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 7 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'commit applies an insertion transaction that splits the paragraph'
	);
	
	// Test 14
	deepEqual(
		documentModel.getChildren()[0].getContentData(),
		['a'],
		'commit keeps model tree up to date with paragraph split (paragraph 1)'
	);
	
	// Test 15
	deepEqual(
		documentModel.getChildren()[1].getContentData(),
		[
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'commit keeps model tree up to date with paragraph split (paragraph 2)'
	);

	// Test 16
	ve.dm.TransactionProcessor.rollback( documentModel, paragraphBreak );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'rollback reverses the effect of a paragraph split on the content'
	);
	
	// Test 17
	deepEqual(
		documentModel.getChildren()[0].getContentData(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'rollback keeps model tree up to date with paragraph split (paragraphs are merged back)'
	);
	
	// Test 18
	deepEqual(
		documentModel.getChildren()[1].getElementType(),
		'table',
		'rollback keeps model tree up to date with paragraph split (table follows the paragraph)'
	);
	
	var listItemMerge = documentModel.prepareRemoval( new ve.Range( 14, 19 ) );
	
	// Test 19
	ve.dm.TransactionProcessor.commit( documentModel, listItemMerge );
	deepEqual(
		documentModel.getData( new ve.Range( 12, 22 ) ),
		[
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' }
		],
		'removal merges two list items with paragraphs'
	);
	
	// Test 20
	deepEqual( documentModel.children[1].children[0].children[0].children[1].children.length, 2,
		'removal keeps model tree up to date with list item merge (number of children)'
	);
	
	// Test 21
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].children[0].children[0].getContentData(),
		[ 'f' ],
		'removal keeps model tree up to date with list item merge (first list item)'
	);
	
	// Test 22
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].children[1].children[0].getContentData(),
		[ 'g' ],
		'removal keeps model tree up to date with list item merge (second list item)'
	);
	
	// Test 23
	deepEqual(
		documentModel.children[2].getContentData(),
		[ 'h' ],
		'rollback keeps model tree up to date with list item split (final paragraph)'
	);
	
	// Test 24
	ve.dm.TransactionProcessor.rollback( documentModel, listItemMerge );
	deepEqual(
		documentModel.getData( new ve.Range( 12, 27 ) ),
		[
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' }
		],
		'rollback reverses list item merge (splits the list items)'
	);
	
	// Test 25
	deepEqual( documentModel.children[1].children[0].children[0].children[1].children.length, 3,
		'rollback keeps model tree up to date with list item split (number of children)'
	);
	
	// Test 26
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].children[0].children[0].getContentData(),
		[ 'e' ],
		'rollback keeps model tree up to date with list item split (first list item)'
	);
	
	// Test 27
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].children[1].children[0].getContentData(),
		[ 'f' ],
		'rollback keeps model tree up to date with list item split (second list item)'
	);
	
	// Test 28
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].children[2].children[0].getContentData(),
		[ 'g' ],
		'rollback keeps model tree up to date with list item split (third list item)'
	);
	
	// Test 29
	deepEqual(
		documentModel.children[2].getContentData(),
		[ 'h' ],
		'rollback keeps model tree up to date with list item split (final paragraph)'
	);
	
	var listSplit = documentModel.prepareInsertion( 17, [{ 'type': '/list' }, { 'type': 'list' }] );

	// Test 30
	ve.dm.TransactionProcessor.commit( documentModel, listSplit );
	deepEqual(
		documentModel.getData( new ve.Range( 15, 21 ) ),
		[
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' }
		],
		'commit splits list into two lists'
	);
	
	// Test 31
	deepEqual(
		documentModel.children[1].children[0].children[0].children.length, 3,
		'commit keeps model tree up to date with list split (number of children)'
	);
	
	// Test 32
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].getElementType(), 'list',
		'commit keeps model tree up to date with list split (first list type)'
	);
	
	// Test 33
	deepEqual(
		documentModel.children[1].children[0].children[0].children[2].getElementType(), 'list',
		'commit keeps model tree up to date with list split (second list type)'
	);
	
	// Test 34
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].getContentData(),
		[
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' }
		],
		'commit keeps model tree up to date with list split (first list content)'
	);
	
	// Test 35
	deepEqual(
		documentModel.children[1].children[0].children[0].children[2].getContentData(),
		[
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' }
		],
		'commit keeps model tree up to date with list split (second list content)'
	);
	
	// Test 36
	ve.dm.TransactionProcessor.rollback( documentModel, listSplit );
	deepEqual(
		documentModel.getData( new ve.Range( 15, 19 ) ),
		[
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' }
		],
		'rollback reverses list split'
	);
	
	// Test 37
	deepEqual(
		documentModel.children[1].children[0].children[0].children.length, 2,
		'rollback keeps model tree up to date with list split (number of children)'
	);
	
	// Test 38
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].getElementType(), 'list',
		'rollback keeps model tree up to date with list split (first list type)'
	);
	
	// Test 39
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].getContentData(),
		[
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' }
		],
		'rollback keeps model tree up to date with list split (first list content)'
	);
	
	
	var contentReplacement = documentModel.prepareContentReplacement( new ve.Range( 32, 33 ), [ 'i', 'j', 'k' ] );
	
	// Test 40
	ve.dm.TransactionProcessor.commit( documentModel, contentReplacement );
	deepEqual(
		documentModel.getData( new ve.Range( 31, 36 ) ),
		[
			{ 'type': 'paragraph' },
			'i', 'j', 'k',
			{ 'type': '/paragraph' }
		],
		'replacement replaces content'
	);
	
	// Test 41
	ve.dm.TransactionProcessor.rollback( documentModel, contentReplacement );
	deepEqual(
		documentModel.getData( new ve.Range( 31, 34 ) ),
		[
			{ 'type': 'paragraph' },
			'h',
			{ 'type': '/paragraph' }
		],
		'rollback restores content'
	);
	
	var paragraphToHeading = documentModel.prepareWrap( new ve.Range( 1, 4 ), [ { 'type': 'paragraph' } ], [ { 'type': 'heading', 'level': 2 } ], [], [] );
	
	// Test 42
	ve.dm.TransactionProcessor.commit( documentModel, paragraphToHeading );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'heading', 'level': 2 },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/heading' }
		],
		'changing paragraph to heading'
	);
	
	// Test 43
	deepEqual(
		documentModel.children[0].getElementType(), 'heading',
		'commit keeps model tree up to date with paragraph->heading change (element type)'
	);
	
	// Test 44
	deepEqual(
		documentModel.children[0].getElement(), { 'type': 'heading', 'level': 2 },
		'commit keeps model tree up to date with paragraph->heading change (element)'
	);
	
	// Test 45
	deepEqual(
		documentModel.children[0].getContentData(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'commit keeps model tree up to date with paragraph->heading change (content data)'
	);
	
	// Test 46
	ve.dm.TransactionProcessor.rollback( documentModel, paragraphToHeading );
	deepEqual(
		documentModel.getData( new ve.Range( 0, 5 ) ),
		[
			{ 'type': 'paragraph' },
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }],
			{ 'type': '/paragraph' }
		],
		'rollback puts paragraph back'
	);
	
	// Test 47
	deepEqual(
		documentModel.children[0].getElementType(), 'paragraph',
		'rollback keeps model tree up to date with paragraph->heading change (element type)'
	);
	
	// Test 48
	deepEqual(
		documentModel.children[0].getElement(), { 'type': 'paragraph' },
		'rollback keeps model tree up to date with paragraph->heading change (element)'
	);
	
	// Test 49
	deepEqual(
		documentModel.children[0].getContentData(),
		[
			'a',
			['b', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' }],
			['c', { 'type': 'textStyle/italic', 'hash': '{"type":"textStyle/italic"}' }]
		],
		'rollback keeps model tree up to date with paragraph->heading change (content data)'
	);
	
	var unwrapList = documentModel.prepareWrap( new ve.Range( 12, 27 ), [ { 'type': 'list' } ], [] , [ { 'type': 'listItem' } ], [] );
	
	// Test 50
	ve.dm.TransactionProcessor.commit( documentModel, unwrapList );
	deepEqual(
		documentModel.getData( new ve.Range( 7, 21 ) ),
		[
			{ 'type': 'tableCell' },
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/tableCell' }
		],
		'unwrapping the list produces a cell with four adjacent paragraphs'
	);
	
	// Test 51
	deepEqual(
		documentModel.children[1].children[0].children[0].children.length, 4,
		'commit keeps model tree up to date with list unwrap (number of children)'
	);
	
	// Test 52
	deepEqual(
		documentModel.children[1].children[0].children[0].children[0].getElementType(), 'paragraph',
		'commit keeps model tree up to date with list unwrap (first child is a paragraph)'
	);
	
	// Test 53
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].getElementType(), 'paragraph',
		'commit keeps model tree up to date with list unwrap (second child is a paragraph)'
	);
	
	// Test 54
	deepEqual(
		documentModel.children[1].children[0].children[0].children[2].getElementType(), 'paragraph',
		'commit keeps model tree up to date with list unwrap (third child is a paragraph)'
	);
	
	// Test 55
	deepEqual(
		documentModel.children[1].children[0].children[0].children[3].getElementType(), 'paragraph',
		'commit keeps model tree up to date with list unwrap (fourth child is a paragraph)'
	);
	
	// Test 56
	deepEqual(
		documentModel.children[1].children[0].children[0].getContentData(),
		[
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
		],
		'commit keeps model tree up to date with list unwrap (content data)'
	);
	
	// Test 57
	ve.dm.TransactionProcessor.rollback( documentModel, unwrapList );
	deepEqual(
		documentModel.getData( new ve.Range( 7, 29 ) ),
		[
			{ 'type': 'tableCell' },
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': '/tableCell' }
		],
		'rollback puts the list back'
	);
	
	// Test 58
	deepEqual(
		documentModel.children[1].children[0].children[0].children.length, 2,
		'rollback keeps model tree up to date with list unwrap (number of children)'
	);
	
	// Test 59
	deepEqual(
		documentModel.children[1].children[0].children[0].children[0].getElementType(), 'paragraph',
		'rollback keeps model tree up to date with list unwrap (first child is a paragraph)'
	);
	
	// Test 60
	deepEqual(
		documentModel.children[1].children[0].children[0].children[1].getElementType(), 'list',
		'rollback keeps model tree up to date with list unwrap (second child is a list)'
	);
	
	// Test 61
	deepEqual(
		documentModel.children[1].children[0].children[0].getContentData(),
		[
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
		],
		'rollback keeps model tree up to date with list unwrap (content data)'
	);
	
	
	var replaceTable = documentModel.prepareWrap( new ve.Range( 8, 28 ), [ { 'type': 'table' }, { 'type': 'tableRow' }, { 'type': 'tableCell' } ],
		[ { 'type': 'list' }, { 'type': 'listItem' } ], [], [] );
	
	// Test 62
	ve.dm.TransactionProcessor.commit( documentModel, replaceTable );
	deepEqual(
		documentModel.getData( new ve.Range( 5, 30 ) ),
		[
			{ 'type': 'list' },
			{ 'type': 'listItem' },
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': 'paragraph' }
		],
		'replacing a table with the list reverses the order of the closing tags correctly'
	);
	
	// Test 63
	deepEqual(
		documentModel.children.length, 3,
		'commit keeps model tree up to date with table replace (number of children of root node)'
	);
	
	// Test 64
	deepEqual(
		documentModel.children[1].getElementType(), 'list',
		'commit keeps model tree up to date with table replace (second child of root node is a list)'
	);
	
	// Test 65
	deepEqual(
		documentModel.children[1].children.length, 1,
		'commit keeps model tree up to date with table replace (number of children of list)'
	);
	
	// Test 66
	deepEqual(
		documentModel.children[1].children[0].getElementType(), 'listItem',
		'commit keeps model tree up to date with table replace (child of list is a listItem)'
	);
	
	// Test 67
	deepEqual(
		documentModel.children[1].children[0].children.length, 2,
		'commit keeps model tree up to date with table replace (number of children of listItem)'
	);
	
	// Test 68
	deepEqual(
		documentModel.children[1].children[0].getContentData(),
		[
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		],
		'commit keeps model tree up to date with table replace (content data of listItem)'
	);
	
	// Test 69
	ve.dm.TransactionProcessor.rollback( documentModel, replaceTable );
	deepEqual(
		documentModel.getData( new ve.Range( 5, 32 ) ),
		[
			{ 'type': 'table' },
			{ 'type': 'tableRow' },
			{ 'type': 'tableCell' },
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' },
			{ 'type': '/tableCell' },
			{ 'type': '/tableRow' },
			{ 'type': '/table' },
			{ 'type': 'paragraph' }
		],
		'rollback puts the table back'
	);
	
	// Test 70
	deepEqual(
		documentModel.children.length, 3,
		'rollback keeps model tree up to date with table replace (number of children of root node)'
	);
	
	// Test 71
	deepEqual(
		documentModel.children[1].getElementType(), 'table',
		'rollback keeps model tree up to date with table replace (second child of root node is a table)'
	);
	
	// Test 72
	deepEqual(
		documentModel.children[1].children.length, 1,
		'rollback keeps model tree up to date with table replace (number of children of table)'
	);
	
	// Test 73
	deepEqual(
		documentModel.children[1].children[0].getElementType(), 'tableRow',
		'rollback keeps model tree up to date with table replace (child of table is a tableRow)'
	);
	
	// Test 74
	deepEqual(
		documentModel.children[1].children[0].children.length, 1,
		'rollback keeps model tree up to date with table replace (number of children of tableRow)'
	);
	
	// Test 75
	deepEqual(
		documentModel.children[1].children[0].children[0].getElementType(), 'tableCell',
		'rollback keeps model tree up to date with table replace (child of tableRow is a tableCell)'
	);
	
	// Test 76
	deepEqual(
		documentModel.children[1].children[0].children[0].children.length, 2,
		'rollback keeps model tree up to date with table replace (number of children of tableCell)'
	);
	
	// Test 77
	deepEqual(
		documentModel.children[1].children[0].children[0].getContentData(),
		[
			{ 'type': 'paragraph' },
			'd',
			{ 'type': '/paragraph' },
			{ 'type': 'list' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet'] } },
			{ 'type': 'paragraph' },
			'e',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['bullet', 'bullet'] } },
			{ 'type': 'paragraph' },
			'f',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': 'listItem', 'attributes': { 'styles': ['number'] } },
			{ 'type': 'paragraph' },
			'g',
			{ 'type': '/paragraph' },
			{ 'type': '/listItem' },
			{ 'type': '/list' }
		],
		'rollback keeps model tree up to date with table replace (content data of tableCell)'
	);
	
	var replacementWithAnnotations = new ve.dm.Transaction();
	replacementWithAnnotations.pushRetain( 24 );
	replacementWithAnnotations.pushStartAnnotating( 'set', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' } );
	replacementWithAnnotations.pushReplace( [ 'g' ], [ 'i', 'j', 'k' ] );
	replacementWithAnnotations.pushStopAnnotating( 'set', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' } );
	replacementWithAnnotations.pushRetain( 10 );
	
	// Test 78
	ve.dm.TransactionProcessor.commit( documentModel, replacementWithAnnotations );
	deepEqual(
		documentModel.getData( new ve.Range( 24, 27 ) ),
		[
			[ 'i', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' } ],
			[ 'j', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' } ],
			[ 'k', { 'type': 'textStyle/bold', 'hash': '{"type":"textStyle/bold"}' } ]
		],
		'replacement replaces content and applies annotations'
	);
	
	// Test 79
	ve.dm.TransactionProcessor.rollback( documentModel, replacementWithAnnotations );
	deepEqual(
		documentModel.getData( new ve.Range( 24, 25 ) ),
		[
			'g'
		],
		'rollback restores content and removes annotations'
	);
	
} );

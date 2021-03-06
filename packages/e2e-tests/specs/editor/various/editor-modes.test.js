/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	clickBlockToolbarButton,
	createNewPost,
	switchEditorModeTo,
} from '@wordpress/e2e-test-utils';

describe( 'Editing modes (visual/HTML)', () => {
	beforeEach( async () => {
		await createNewPost();
		await clickBlockAppender();
		await page.keyboard.type( 'Hello world!' );
	} );

	it( 'should switch between visual and HTML modes', async () => {
		// This block should be in "visual" mode by default.
		let visualBlock = await page.$$(
			'.block-editor-block-list__layout .block-editor-block-list__block.rich-text'
		);
		expect( visualBlock ).toHaveLength( 1 );

		// Move the mouse to show the block toolbar
		await page.mouse.move( 0, 0 );
		await page.mouse.move( 10, 10 );

		// Change editing mode from "Visual" to "HTML".
		await clickBlockToolbarButton( 'More options' );
		let changeModeButton = await page.waitForXPath(
			'//button[text()="Edit as HTML"]'
		);
		await changeModeButton.click();

		// Wait for the block to be converted to HTML editing mode.
		const htmlBlock = await page.$$(
			'.block-editor-block-list__layout .block-editor-block-list__block .block-editor-block-list__block-html-textarea'
		);
		expect( htmlBlock ).toHaveLength( 1 );

		// Move the mouse to show the block toolbar
		await page.mouse.move( 0, 0 );
		await page.mouse.move( 10, 10 );

		// Change editing mode from "HTML" back to "Visual".
		await clickBlockToolbarButton( 'More options' );
		changeModeButton = await page.waitForXPath(
			'//button[text()="Edit visually"]'
		);
		await changeModeButton.click();

		// This block should be in "visual" mode by default.
		visualBlock = await page.$$(
			'.block-editor-block-list__layout .block-editor-block-list__block.rich-text'
		);
		expect( visualBlock ).toHaveLength( 1 );
	} );

	it( 'should display sidebar in HTML mode', async () => {
		// Move the mouse to show the block toolbar
		await page.mouse.move( 0, 0 );
		await page.mouse.move( 10, 10 );

		// Change editing mode from "Visual" to "HTML".
		await clickBlockToolbarButton( 'More options' );
		const changeModeButton = await page.waitForXPath(
			'//button[text()="Edit as HTML"]'
		);
		await changeModeButton.click();

		// The font size picker for the paragraph block should appear, even in
		// HTML editing mode.
		const fontSizePicker = await page.$$(
			'.edit-post-sidebar .components-font-size-picker__controls'
		);
		expect( fontSizePicker ).toHaveLength( 1 );
	} );

	it( 'should update HTML in HTML mode when sidebar is used', async () => {
		// Move the mouse to show the block toolbar
		await page.mouse.move( 0, 0 );
		await page.mouse.move( 10, 10 );

		// Change editing mode from "Visual" to "HTML".
		await clickBlockToolbarButton( 'More options' );
		const changeModeButton = await page.waitForXPath(
			'//button[text()="Edit as HTML"]'
		);
		await changeModeButton.click();

		// Make sure the paragraph content is rendered as expected.
		let htmlBlockContent = await page.$eval(
			'.block-editor-block-list__layout .block-editor-block-list__block .block-editor-block-list__block-html-textarea',
			( node ) => node.textContent
		);
		expect( htmlBlockContent ).toEqual( '<p>Hello world!</p>' );

		// Change the font size using the sidebar.
		await page.click( '.components-font-size-picker__select' );
		await page.click(
			'.components-custom-select-control__item:nth-child(5)'
		);
		await page.waitForXPath(
			`//button[contains(@class, "components-custom-select-control__button") and contains(text(), 'Large')]`
		);

		// Make sure the HTML content updated.
		htmlBlockContent = await page.$eval(
			'.block-editor-block-list__layout .block-editor-block-list__block .block-editor-block-list__block-html-textarea',
			( node ) => node.textContent
		);
		expect( htmlBlockContent ).toEqual(
			'<p class="has-large-font-size">Hello world!</p>'
		);
	} );

	it( 'the code editor should unselect blocks and disable the inserter', async () => {
		// The paragraph block should be selected
		const title = await page.$eval(
			'.block-editor-block-card__title',
			( element ) => element.innerText
		);
		expect( title ).toBe( 'Paragraph' );

		// The Block inspector should be active
		let blockInspectorTab = await page.$(
			'.edit-post-sidebar__panel-tab.is-active[data-label="Block"]'
		);
		expect( blockInspectorTab ).not.toBeNull();

		await switchEditorModeTo( 'Code' );

		// The Block inspector should not be active anymore
		blockInspectorTab = await page.$(
			'.edit-post-sidebar__panel-tab.is-active[data-label="Block"]'
		);
		expect( blockInspectorTab ).toBeNull();

		// No block is selected
		await page.click( '.edit-post-sidebar__panel-tab[data-label="Block"]' );
		const noBlocksElement = await page.$(
			'.block-editor-block-inspector__no-blocks'
		);
		expect( noBlocksElement ).not.toBeNull();

		// The inserter is disabled
		const disabledInserter = await page.$(
			'.block-editor-inserter > button:disabled, .block-editor-inserter > button[aria-disabled="true"]'
		);
		expect( disabledInserter ).not.toBeNull();
	} );
} );

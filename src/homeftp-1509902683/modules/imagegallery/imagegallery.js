(function ($) {

$.imagegallery	= {
	close: function () {
		$.modal.close();
	},
	currentImage: {},
	titleContainer: {},
	descriptionContainer: {}
};

$.fn.imagegallery = function (options) {
	var el			= this,
		settings	= {},
		isLocked	= false,
		itemsToLoad	= [];

	/**
	 * Resets loaded items
	 */
	function resetItemsToLoad() {
		itemsToLoad	= [];
	}

	/**
	 * Add item to load
	 *
	 * @param {Number} i
	 * @param {String} url
	 */
	function addItemToLoad(i, url) {
		itemsToLoad[i] = url;
	}

	/**
	 * Tells use when we already loaded item
	 *
	 * @param {Number} i
	 * @return {Boolean}
	 */
	function isItemLoaded(i) {
		return (false === itemsToLoad[i]);
	}

	/**
	 * Mark item as already loaded
	 *
	 * @param {Number} i
	 */
	function markItemAsLoaded(i) {
		itemsToLoad[i] = false;
	}

	/**
	 * When item isn`t loaded -- we load item and mark it as loaded
	 *
	 * @param {Number} i
	 */
	function loadItem(i) {
		if (0 == itemsToLoad.length) {
			throw new Error('Items to load should be loaded before loading item');
		}
		if (isItemLoaded(i)) {
			return;
		}
		$('#view-image-' + i).attr('src', itemsToLoad[i]);
		markItemAsLoaded(i);
	}

	function isDefaultTitle(title) {
		return title == settings.locale.defaultTitle;
	}

	function init() {
		settings = $.extend(true, {}, $.fn.imagegallery.defaults, options);

		var store = settings.store;
		switch (store.type) {
			case 'array':
				render(filter(store.data));
				break;
			case 'picasa':
				if (store.username === '' || store.albumId === '' || store.album === '') {
					throw new Error('Module not configured');
				}
				requestPicasaAlbum(store);
				break;
			default:
				throw new Error('Unknown store type.');
		};
	}

	function htmlEncode(str) {
		return str.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
	}

	function newLineToBr(str) {
		return str.replace(/\n/g, '<br/>');
	}

	function filter(items) {
		var filteredItems = [],
			deletedImages = settings.store.deletedImages;
		for (var i = 0, iMax = items.length; i < iMax; i++) {
			var item = items[i];
			if ($.inArray(item.id, deletedImages) == -1) {
				filteredItems.push(item);
			}
		}
		return filteredItems;
	}

	function render(items) {
		var listHtml		= $('<div class="frames-' + settings.thumbSize + '"/>'),
			frameIdPrefix	= 'frame-';

		for (var i = 0, iMax = items.length; i < iMax; i++) {
			var item		= items[i],
				title		= isDefaultTitle(item.title) ? '' : item.title,
				itemHtml	= $(
				'<div id="' + frameIdPrefix + item.id + '" class="frame">' +
					'<div class="preview-holder">' +
						'<div class="preview" style="background-image: url(\'' + item.thumbUrl + '\');">' +
							'<a href="' + item.url + '">' +
								'<img src="' + item.thumbUrl + '" alt="' + title + '"/>' +
							'</a>' +
						'</div>' +
					'</div>' +
					'<div class="name">' + title + '</div>' +
					'<div class="description">' + newLineToBr(htmlEncode(item.description)) + '</div>' +
				'</div>'
			);
			itemHtml.hover(function() {
				$(this).addClass('frame-hover');
			}, function() {
				$(this).removeClass('frame-hover');
			});
			itemHtml.find('.preview').bind('click', [i], function(event) {
				if (isLocked) {
					return;
				}
				event.stopPropagation();
				event.preventDefault();
				openView(items, event.data[0]);
			});
			listHtml.append(itemHtml);
		}

		el.html(listHtml);
	}

	function openView(items, start) {
		var view, tools, mainViewUl, thumbViewUl, controls, i, item, mainView, thumbView, previewControlsDiv, previewControls, visibleItems,
			dialogViewWidth		= $(window).width() * 0.8,
			imageViewMaxWidth	= dialogViewWidth - 160,
			imageViewMaxHeight	= $(window).height() - 230,
			msg					= settings.locale,
			visibleItems		= Math.min(items.length, 5),
			isMainNavigation	= items.length > 1,
			isThumbNavigation	= items.length > visibleItems;

		view = $('<div id="view"> \
			<table cellpadding="0" cellspacing="0" id="thumb"> \
				<tr> \
					<td><div id="thumb-prev"></div></td> \
					<td> \
						<div id="thumb-view"></div> \
					</td> \
					<td><div id="thumb-next"></div></td> \
				</tr> \
			</table> \
			<div id="main"> \
				<table cellpadding="0" cellspacing="0" align="center"> \
					<tr> \
						<td id="view-prev"><div id="main-prev"></div></td> \
						<td id="view-panel"> \
							<div id="view-tools"></div> \
							<div id="view-counter">' + msg.imageText + ' <span class="num">0</span> ' + msg.counterSeparatorText + ' <span class="count">0</span></div> \
							<div id="main-view"></div> \
							<div id="view-details"> \
								<div id="view-title"></div> \
								<div id="view-description"></div> \
							</div> \
							<div id="view-close" class="simplemodal-close">' + msg.closeText + '</div> \
						</td> \
						<td id="view-next"><div id="main-next"></div></td> \
					</tr> \
				</table> \
			</div> \
		</div>');

		tools = view.find('#view-tools');

		if (settings.isShowRemove) {
			tools.append(renderTool({
				id		: 'imageGalleryRemoveButton',
				cls		: 'remove-button',
				text	: msg.removeImage
			}));
		}

		if (settings.isShowFullSize) {
			tools.append(renderTool({
				id		: 'imageGalleryFullSizeButton',
				cls		: 'fullsize-button',
				text	: msg.fullSizeImage
			}));
		}

		mainViewUl			= $('<ul></ul>');
		thumbViewUl			= $('<ul></ul>');
		previewControlsDiv	= $('<div class="preview-controls"></div>');
		controls			= [];
		previewControls		= [];
		resetItemsToLoad();
		for (i = 0; i < items.length; i++) {
			item = items[i];
			addItemToLoad(i, item.url);
			var imageUrl = item.thumbUrl;
			if (i == start) {
				markItemAsLoaded(i);
				imageUrl = item.url;
			}
			mainViewUl.append(
				'<li id="view' + i + '"> \
					<table cellpadding="0" cellspacing="0"> \
						<tr><td><img id="view-image-' + i + '" src="' + imageUrl + '" alt=""/></td></tr> \
					</table> \
				</li>'
			);

			thumbViewUl.append(
				'<li class="view-control' + i + '"> \
					<div class="preview-holder"> \
						<a href="' + item.url + '" class="preview" style="background-image: url(' + item.thumbUrl + ');"><img src="' + item.thumbUrl + '" alt=""></a> \
					</div> \
				</li>'
			);

			previewControlsDiv.append('<span class="preview-control' + i + '"></span>');

			controls.push('.view-control' + i);
			previewControls.push('.preview-control' + i);
		}

		mainView	= view.find('#main-view');
		thumbView	= view.find('#thumb-view');
		mainView.append(mainViewUl);
		thumbView.append(thumbViewUl);
		view.append(previewControlsDiv);

		view.find('#view-counter .count').html(items.length);

		view.width(dialogViewWidth);
		mainView.width(dialogViewWidth);
		mainView.find('table').width(imageViewMaxWidth);
		mainView.find('td').height(imageViewMaxHeight);
		mainView.find('img').css({
			'max-height': imageViewMaxHeight,
			'max-width': imageViewMaxWidth
		});

		view.find('#main-prev, #main-next').css('margin-top', ($(window).height() / 2 - 49) + 'px');
		$('html, body').addClass('scroll');
		view.modal({
			opacity			: 80,
			zIndex			: 8000,
			overlayId		: 'overlay',
			overlayClose	: true,
			onOpen			: function(dialog) {
				dialog.overlay.show();
				dialog.container.show();
				dialog.data.show();
			},
			onClose			: function(dialog) {
				isLocked = true;
				if (settings.closeImageCallback) {
					settings.closeImageCallback($.imagegallery);
					$(document).unbind('keydown.imagegallery');
				}
				$('html, body').removeClass('scroll');
				$.modal.close();
				setTimeout(function() {isLocked = false;}, 20);
			}
		});

		if (!isMainNavigation) {
			$('#main-next,#main-prev').addClass('disabled');
		}
		if (!isThumbNavigation) {
			$('#thumb-next,#thumb-prev').addClass('disabled');
		}
		mainView.jCarouselLite({
			btnNext		: isMainNavigation ? '#main-next' : null,
			btnPrev		: isMainNavigation ? '#main-prev' : null,
			visible		: 1,
			btnGo		: controls,
			start		: start,
			circular	: false,
			afterEnd	: function(a) {
				var num = parseInt(a.attr('id').replace('view', ''), 10);
				$.imagegallery.currentImage = items[num];
				updateDetails(num);
				selectPreview(num, true, visibleItems, items.length);
			}
		});
		thumbView.jCarouselLite({
			btnNext		: isThumbNavigation ? '#thumb-next' : null,
			btnPrev		: isThumbNavigation ? '#thumb-prev' : null,
			btnGo		: previewControls,
			visible		: visibleItems,
			circular	: false,
			afterEnd	: function(a) {
				a.each(function(i, li){
					var num = $(li).attr('class').match(/view\-control(\d+)/)[1];
					loadItem(num);
				});
			}
		});

		$.imagegallery.currentImage = items[start];
		$.imagegallery.titleContainer = $('#view-title');
		$.imagegallery.descriptionContainer = $('#view-description');

		if (settings.openImageCallback) {
			settings.openImageCallback($.imagegallery);
		}

		$(document).bind('keydown.imagegallery',function(e){
			switch(e.keyCode){
				case 37:
					$('#main-prev').click();
					e.stopPropagation();
					e.preventDefault();
					break;
				case 39:
					$('#main-next').click();
					e.stopPropagation();
					e.preventDefault();
					break;
			};
		});

		updateDetails(start);
		selectPreview(start, true, visibleItems, items.length);

		thumbView.find('a').click(function() {
			$(this).parents('li').click();
			return false;
		});
	}

	function updateDetails(num) {
		var counterContainer	= $('#view-counter .num'),
			ig 					= $.imagegallery,
			title				= (isDefaultTitle(ig.currentImage.title) ? '' : ig.currentImage.title);

		counterContainer.html(num + 1);

		ig.titleContainer.html(title);
		ig.descriptionContainer.html(newLineToBr(htmlEncode(ig.currentImage.description)));
		settings.changeImageCallback(ig);
	}

	function renderTool(config) {
		var tool = $(
			'<table id="' + config.id + '" cellpadding="0" cellspacing="0" class="button ' + config.cls + '"> \
				<tr> \
					<td class="l"></td> \
					<td class="m"><i>&nbsp;</i>' + config.text + '</td> \
					<td class="r"></td> \
				</tr> \
			</table>'
		);

		tool.hover(
			function () { $(this).addClass('button-hover'); },
			function () { $(this).removeClass('button-hover'); }
		).mousedown(
			function () { $(this).addClass('button-active'); }
		).mouseup(
			function () { $(this).removeClass('button-active'); }
		);

		if (config.handler) {
			tool.bind('click', function(event) {
				event.stopPropagation();
				event.preventDefault();
				config.handler();
			});
		}

		return tool;
	}

	function selectPreview(index, move, visible, total) {
		$('#thumb-view li').removeClass('active');
		if (move) {
			var shift = Math.floor(visible / 2),
				moveTo = Math.max((index - shift), 0);

			if ((total - index + 1) < visible) {
				moveTo = total - visible;
			}
			$('.preview-control' + moveTo).click();
		}
		$('.view-control' + index).addClass('active').click();
	}

	function requestPicasaAlbum(store) {
		var	params	= 'fields=entry(gphoto:id,content,title,summary)&kind=photo&v=2.0&alt=json',
			tmp		= store.albumUrl.split('?').concat(params),
			url		= tmp.shift().concat('?').concat(tmp.join('&'));
		$.getJSON(url, 'callback=?', onResponsePicasaAlbum);
	}

	function onResponsePicasaAlbum(response) {
		var album = parsePicasaAlbum(response.feed);
		if (album) {
			render(filter(album.items));
		}
	}

	function parsePicasaAlbum(data) {
		if (!data.entry) {
			return false;
		}
		var album	= {
				title		: data.title === undefined				? '' : data.title.$t,
				description	: data.subtitle === undefined			? '' : data.subtitle.$t,
				location	: data.gphoto$location === undefined	? '' : data.gphoto$location.$t,
				date		: data.gphoto$timestamp === undefined	? '' : data.gphoto$timestamp.$t,
				items		: []
			},
			entry	= data.entry,
			iMax	= entry.length;

		for (var i = 0; i < iMax; i++) {
			var image = entry[i];
			album.items.push({
				id			: image.gphoto$id.$t,
				url			: image.content.src,
				thumbUrl	: image.content.src + '?imgmax=150',
				title		: image.title ? image.title.$t : '',
				description	: image.summary ? image.summary.$t : ''
			});
		}

		return album;
	}

	init();
};

$.fn.imagegallery.defaults = {
	thumbSize				: 'normal',
	isShowRemove			: false,
	isShowFullSize			: false,
	openImageCallback		: function(gallery){},
	closeImageCallback		: function(gallery){},
	changeImageCallback		: function(gallery){},
	store					: {
		type			: 'array',
		data			: [],
		deletedImages	: []
	},
	locale					: {
		imageText				: 'Image',
		counterSeparatorText	: ' of ',
		prevText				: 'Previous',
		nextText				: 'Next',
		closeText				: 'Close',
		removeImage				: 'Remove image',
		fullSizeImage			: 'See full size image',
		defaultTitle			: 'Name'
	}
};

})(jQuery);
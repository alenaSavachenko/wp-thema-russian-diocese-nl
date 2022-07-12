/* ------------------------------------------------------------------------
	* Swift Box - jQuery contents slider and viewer
	*
	* @version: 	2.1
	* @requires:	jQuery v1.7
	* @author:		Luca Montanari aka LCweb (https://lcweb.it)
------------------------------------------------------------------------- */

(function ($) {
	lcnb_box_id 		= 1; // static resource for IDs
	lcnb_resize_tout 	= [];
	lcnb_exp_scroll_tout= [];
	
	
	var lc_SwiftBox = function(element, lcnb_settings) {
		var udf = 'undefined';
		
		var settings = $.extend({
			src: [], 				// (array) 	news sources
			rss2json_token: false,	// (string) added in January 2019 to replace YQL - allows RSS fetching: grab it here https://rss2json.com/plans
			only_w_images: false,	// (bool)	just keeps news with an image
			
			preloader: true,		// (bool)	whether to show a preloader waiting for news to be fetched		
			theme: 'light',			// (string) which theme to use - use the CSS file name
			layout: 'horizontal', 	// (string) news layout (horizontal | vertical)
			
			height: 300,			// (int)	box height
			width: '100%',			// (string)	box width - use CSS units 
			min_news_h: 100,		// (int)	minimum news height for vertical layout
			min_news_w: 200,		// (int)	minimum news width for horizontal layout
			min_horiz_w: 400,		// (int)	minimum box width to switch from horzontal to vertical mode
	
			horiz_img_h: false,		// (bool/int) images height for horizontal layout, use false to inherit CSS sizes
			vert_img_w: false,		// (bool/int) images width for vertical layout, use false to inherit CSS sizes
			
			read_more_txt: '..',		// (string)	text used on shortened descriptions end
			boxed_news: false,			// (bool)	whether to display news into a standalone box
			horiz_img_mode: false,		// (bool)	full-height image and no description in horizontal layout (only if there's an image)
			buttons_position: 'bottom', // (string) defines buttons/date position - bottom | top | side (only for vertical and boxed layout) 
			
			max_news: 6, 			// (int) 	maximum news number to fetch
			news_per_time: 3, 		// (int) 	how many news to show per time (value dynamically managed in relation to min_news_VAL)
			social_share: true,		// (bool)	whether to show social share buttons 
			hide_elements: [],		// (array)	elements to hide - possible values: date | title | image | link | btn_bar

			script_basepath: false, 	// (bool/string) basepath to plugin's folder - using false the plugin will try retrieving it
			scripts_man_added: false,	// (bool)	use true to avoid dyamic scripts inclusion - comes handy if you concat an minify scripts
			touchswipe: true,			// (bool)	whether to enable touchswipe support
			lightbox: true,				// (bool)	whether to enable lightbox for big images, youtube videos and soundcloud

			title_behavior: 'expand',	// (string)	sets title behavior on click - none | expand | link
			img_behavior: 'lightbox', 	// (string)	sets image behavior on click - none | expand | link | lightbox
			
			date_format: "d mmmm yyyy",	// (string) date format shown - you can mix: SS | MM | H | HH | HHH | d | dd | ddd | dddd | m | mm | mmm | mmmm | yy | yyyy
			elapsed_time: false,		// (bool)	whether to show elapsed time instead of news date
			
			read_more_btn: false,			// (bool)	whether to replace date box with a "read more" button
			read_more_btn_txt: 'Read more', // (string) text displayed in the "read more" button
			
			nav_arrows: false,		// (bool)	defines navigation arrows position - false (hide) | side | top_l | top_c | top_r | bottom_l | bottom_c | bottom_r 
			autoplay: false,		// (bool)	whether to autostart slideshow on box show
			animation_time: 700, 	// (int)	slideshow animation timing in millisecods
			slideshow_time: 6000, 	// (int)	slideshow interval time in millisecods
			carousel: false,		// (bool)	whether to use the infinite carousel mode
			slide_all: false,		// (bool)	whether to slide every visible box per time
			pause_on_hover: true,	// (bool)	whether to pause and restart slideshow on box hover
			
			expandable_news: true,		// (bool)	true to allow news expansion, seeing full contents
			scroll_exp_elem: true,		// (bool)	whether to keep side-image and close button always visible on high expanded news
			exp_main_img_pos: 'inside', // (string) sets main image position in expanded mode - inside | side | hidden
			manage_exp_images: true,	// (bool) 	whether to manage news images to become sizable and add lightbox support in expanded mode 
			exp_img_w: '1_2',			// (string)		images container width for expanded layout (sizes are basically width fractions) - 1_1 | 1_2 | 1_3 | 1_4  
			exp_img_h: 225,				// (int/string)	images container height for expanded layout (in pixels) - use auto to keep image proportions
			exp_img_on_row: false, 		// (bool)	whether to create an horizontal row with managed expanded images
			autop_after_exp: false, 	// (bool)	whether to resume autoplay after expanded news closing 
			
			exp_in_lightbox: false,		// (bool)	whether to show expanded contents through lightbox
			exp_lb_w: '90%',			// (string) percentage representing lightbox elastic width
			exp_lb_max_w: 1200,			// (int)	maximum lightbox width on desktop screens
			
			// date strings - for localization
			short_d_names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			full_d_names : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			short_m_names: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			full_m_names : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			elapsed_names: ["ago", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks", "month", "months"]
				 
		}, lcnb_settings);

	
		// instance variables
		var vars = { 
			box_id			: lcnb_box_id++,
			box_curr_w		: Math.round($(element).width()), // resource used for trigger resizes only if effective size changed
			
			news_array 		: [],	// array containing fetched news
			sorted_news 	: [],	// array containing fetched news, sorted by date
			fetches_done 	: 0,	// how many source fetches have been done
			news_count 		: 0,	// available news count
			inl_news_count	: 0,	// counting how many inline news have been fetched
			orig_texts		: [],	// news original texts - associative array(news_id => text)
			excerpts		: [],	// someties news has got specific excerpts to be used
			clean_texts		: [], 	// cache managed texts to avoid useless resouces waste 
			
			news_w 			: 0,	// news width (in pixels) (for horizontal layout)
			news_h 			: 0,	// news height (in pixels) (for vertical layout)
			news_to_show 	: 0,	// counting how many news the box is showing 
			first_shown 	: 1,	// which is the first news shown? Used to calculate the sliding offset - not for carousels! 
			curr_box_margin : 0,	// current negative margin applied to news inner wrap - useful for continuous sliding fx 
			
			is_shown 		: false,	// whether box is shown 
			is_playing 		: false,	// whether slideshow is enabled
			is_moving 		: false,	// whether slideshow is moving elements 
			waiting_for_anim: false,	
			
			paused_on_h 	: false,	// flag used to know whether to restore slideshow on mouseout
			is_expanded 	: false,	// flag used to know whether a news is expanded 
			event_type 		: 'click'	// click of tap for mobile devices
		};	
		
		
		// .data() system to avoid issues on multi instances
		var $lcnb_wrap_obj = $(element);
		$lcnb_wrap_obj.data('lcnb_vars', vars);
		$lcnb_wrap_obj.data('lcnb_settings', settings);		
			
			
			
		/////////////////////////////////////////////////////////////////	



		/* parse inline news */
		var parse_inline_news = function() {
			if( $lcnb_wrap_obj.find('.nb_news_wrap').length) {
	
				$lcnb_wrap_obj.find('.nb_news_wrap').each(function() {
					var $wrap 		= $(this);
						img_max_w 	= parseInt( $wrap.attr('img_max_w') ),
						img_max_h 	= parseInt( $wrap.attr('img_max_h') ),
						link_target = (typeof($wrap.attr('link_target')) != udf) ? $wrap.attr('link_target') : false,
						strip_tags 	= (typeof($wrap.attr('strip_tags')) != udf) ? $wrap.attr('strip_tags') : false, 
						remove_tags = (typeof($wrap.attr('remove_tags')) != udf) ? $wrap.attr('remove_tags') : false; 
					
					$wrap.find('article').each(function(i, v) {
                    	
						// img size checker
						if(img_max_w && img_max_h) {
							$(this).find('section img').each(function() {
								var src = (typeof( $(this).attr('lazy-src') ) != udf) ? $(this).attr('lazy-src') : $(this).attr('src'); 
								var new_url = lcnb_script_basepath + 'php_assets/img_size_check.php?src='+ encodeURIComponent(src) +'&max_w='+ img_max_w +'&max_h='+ img_max_h;
								$(this).attr('src', new_url);
							});
						}
							
						var date 	= $(this).attr('datetime'),
							title 	= $(this).find('header').text(),
							txt 	= $(this).find('section').lcnb_unselfclose_iframes().html(),
							exc 	= ($(this).children('blockquote').length) ? $(this).children('blockquote').html() : '',
							link 	= $(this).find('.lcnb_inline_link').attr('href'), 
							video 	= $(this).find('.lcnb_video').attr('src');
						
						// delete link
						$(this).find('.lcnb_inline_link').remove();
						
						// safe featured image check
						$main_img = ($(this).find('img.lcnb_main_img').length) ? $(this).find('img.lcnb_main_img') : $(this).children('img');
						
						// lazy img loading
						var main_img_src = (typeof( $main_img.attr('lazy-src')) != udf) ? $main_img.attr('lazy-src') : $main_img.attr('src');
						var img = ($main_img.length) ? img_size_check_url(main_img_src, img_max_w, img_max_h) : '';
						
						// if want to strip or remove something
						if(strip_tags || remove_tags) {
							var txt_data = man_feed_descr(txt, false, false, strip_tags, remove_tags);
							txt = txt_data.txt;	
						}
						
					    if( typeof(date) != udf && typeof(txt) != udf && $.trim(txt) != '' ) {
							
							var d = new Date(date);
							var news_obj = {
								type	: 'inline', 
								time	: d.getTime(),
								date 	: date,
								title	: title,
								txt		: txt,
								excerpt : exc,
								link	: link,
								s_link	: link,
								img		: img,
								video	: video,
								link_target	: link_target,
								exp_img_pos	: (typeof($wrap.attr('exp_img_pos')) != udf) ? $wrap.attr('exp_img_pos') : false,
								exp_img_w	: (typeof($wrap.attr('exp_img_w')) != udf) ? $wrap.attr('exp_img_w') : false,
								exp_img_h	: (typeof($wrap.attr('exp_img_h')) != udf) ? $wrap.attr('exp_img_h') : false
							};
							
							// exclude chosen parameters
							if($.inArray('title', settings.hide_elements) !== -1) 	{news_obj.title = '';}
							if($.inArray('link', settings.hide_elements) !== -1) 	{news_obj.link = '';}
							if($.inArray('image', settings.hide_elements) !== -1) 	{news_obj.img = '';} 
							
							if(settings.only_w_images && !news_obj.img) {
								return true;	
							}
							
							vars.news_array.push(news_obj);
							vars.inl_news_count = vars.inl_news_count + 1;
							
							if(i == (settings.max_news - 1)) {
								return false;
							}
						}
                    });
				});  
			}	
		};
			
			
		
		/* handle sources */
		var handle_sources = function() {
			
			// no external sources? initialize with inline ones
			if(!settings.src.length) {
				news_date_sort($lcnb_wrap_obj);
			}

			$.each(settings.src, function(index, v) {
				var src_obj = this,
					params  = '',
					to_call = '';
				
				// find the url to call to get the data
				switch(this.type) {
					case 'facebook' : 
						to_call = 'https://graph.facebook.com/v2.12/'+ src_obj.id +'/posts?fields=name,message,picture,description,created_time,link,attachments{media},type,object_id&limit='+ settings.max_news +'&access_token=305852493286041|opJMX7AJ9fVNa8xLvgohARTOR3k';						
						break;
						
						
					case 'twitter' : 
						var rts = (typeof(src_obj.include_retweet) == udf || src_obj.include_retweet === true) ? 'true' : 'false';
						to_call = lcnb_script_basepath + 'php_assets/twitter_oauth.php';
						params = { url : 'statuses/user_timeline.json?screen_name='+ src_obj.id +'&exclude_replies=true&tweet_mode=extended&include_rts='+ rts +'&count='+ (settings.max_news + 2)};
						break;	
					
						
					case 'google' : 
						// get the user ID
						if(src_obj.id.indexOf('/') > -1) {
							var pos = src_obj.id.indexOf('?');
							if(pos > -1) {
								src_obj.id = src_obj.id.substring(0, pos);
							}
							if(src_obj.id.indexOf('/posts') === -1) { // august 2017 - profiles don't have /posts - force it to be retrocompatible
								src_obj.id += '/posts'; 	
							}
							var arr = src_obj.id.split('/');
							var clean_id = arr[ (arr.length - 2) ];
						}
						else {var clean_id = src_obj.id;}
						
						to_call = 'https://www.googleapis.com/plus/v1/people/'+ clean_id +'/activities/public?key=AIzaSyCalvBYOVexkTeFT5aIELfgpTVlyGCIvvA';
						params = { 
							maxResults: settings.max_news,
							prettyprint: false,
							fields: 'items(actor(image), annotation, object(content, attachments(content,fullImage,image,thumbnails,objectType)), published, url, verb)'
						};
						break;	
						
						
					case 'youtube' : 
						var yt_max_res = (settings.max_news > 50) ? 50 : settings.max_news;
						
						// retrieving a playlist?
						if(typeof(src_obj.playlist) != udf) {
							to_call = 'https://www.googleapis.com/youtube/v3/playlistItems?playlistId='+ encodeURIComponent(src_obj.playlist) +'&key=AIzaSyCalvBYOVexkTeFT5aIELfgpTVlyGCIvvA&part=snippet&order=date&maxResults='+ yt_max_res;	
						}
						
						// API v3 - get channel ID
						else {
							$.ajax({
								url: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername='+ src_obj.id +'&maxResults=1&key=AIzaSyCalvBYOVexkTeFT5aIELfgpTVlyGCIvvA',
								dataType: 'jsonp',
								success: function(resp) {
									
									// user is found
									if(resp.items.length) {
										var ch_id = (resp.items.length == 0) ? '' : resp.items[0].id;
	
										to_call = 'https://www.googleapis.com/youtube/v3/activities?part=snippet&channelId='+ ch_id +'&maxResults='+ yt_max_res +'&fields=items(contentDetails%2Csnippet)&key=AIzaSyCalvBYOVexkTeFT5aIELfgpTVlyGCIvvA';
									}
									
									// is a channel
									else {
										to_call = 'https://www.googleapis.com/youtube/v3/search?channelId='+ encodeURIComponent(src_obj.id) +'&key=AIzaSyCalvBYOVexkTeFT5aIELfgpTVlyGCIvvA&part=snippet&order=date&maxResults='+ yt_max_res;
									}
									
									var is_yt_chann = (resp.items.length) ? false : true;
									fetch_news(index, 'youtube', to_call, params, src_obj, {is_yt_channel : is_yt_chann});
								}
							});
						}
						break;
						
						
					case 'pinterest' : 
						var raw_url = src_obj.url;
						if( raw_url.substr(raw_url.length - 1) == '/' ) {raw_url = raw_url.substr(0, (raw_url.length - 1));}
					
						to_call = raw_url.toLowerCase().replace('http://', 'https://') + '.rss';
						break;	
						
						
					case 'soundcloud' : 
						var raw_url = src_obj.url;
						if( raw_url.substr(raw_url.length - 1) == '/' ) {raw_url = raw_url.slice(0, -1);}
						
						var arr = raw_url.split('/');
						var username = arr[arr.length-1];
						
						// NEW API - get user ID
						$.ajax({
							url: 'https://api.soundcloud.com/resolve?url='+ encodeURIComponent('https://soundcloud.com/'+username) +'&client_id=4bc0297066dd5e45babd36ce10075160',
							dataType: 'jsonp',
							success: function(resp) {
								
								if( typeof(resp) == 'object' && resp.id) {
									to_call = 'https://api.soundcloud.com/users/'+ resp.id +'/tracks?client_id=4bc0297066dd5e45babd36ce10075160';
									fetch_news(index, 'soundcloud', to_call, params, src_obj);
								}
								else {
									console.error('swiftbox - failed to get soudcloud user ID for '+username);
								}
							}
						});
						
						
						to_call = 'https://api.soundcloud.com/users/'+ username +'/tracks?client_id=4bc0297066dd5e45babd36ce10075160';
						break;			
					
					
					case 'tumblr' : 
						var raw_url = src_obj.url,
							url_arr = raw_url.toLowerCase().replace('http://', '').replace('https://', '').split('/'),
							blog_id = url_arr[0];

						to_call = 'https://api.tumblr.com/v2/blog/'+blog_id+'/posts?api_key=pcCK9NCjhSoA0Yv9TGoXI0vH6YzLRiqKPul9iC6OQ6Pr69l2MV&filter=text&limit='+settings.max_news;
						break;	
						
						
					default: // RSS
						to_call = src_obj.url;
						break;		 	
				}
				
				
				// remote feed? use rss2json
				if(this.type == 'rss' || this.type == 'pinterest') {
					params = {
						rss_url: to_call,
						api_key: settings. rss2json_token,
						count: settings.max_news
					};
					to_call = 'https://api.rss2json.com/v1/api.json';
				} 
				
				
				// Youtube channel and Soundcloud uses a different call  
				if((src_obj.type != 'youtube' && src_obj.type != 'soundcloud') || (src_obj.type == 'youtube' && typeof(src_obj.playlist) != udf)) {
					fetch_news(index, src_obj.type, to_call, params, src_obj); 
				}
			});
		};
				
			
		
		/* fetch news from remote sources */	
		var fetch_news = function(index, type, src, params, src_opts, custom_opts) {

			// elements to exclude 
			var exclude = settings.hide_elements;
			if(typeof(src_opts.hide_elements) == 'object') {
				exclude = $.merge(exclude, src_opts.hide_elements);	
			}
			
			// fixed image
			var fixed_img = (src_opts.img == undefined) ? false : src_opts.img; 
			
			// images max sizes
			var max_img_size = (typeof(src_opts.max_img_size) == 'object') ? src_opts.max_img_size : false; 
			
			// regular expression to link textual URLs
			var url_exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
			
			
			// fetch
			var dataType = ( jQuery.inArray(type, ['facebook', 'twitter', 'rss', 'pinterest']) !== -1) ? "json" : "jsonp";
			$.ajax({
				url: src,
				data: params,
				dataType: dataType,
				
				error: function(request, error) {
					console.error([type, src, error]);
				},
				success: function(resp) {
					var error = false;
					vars.fetches_done = vars.fetches_done + 1;
					
					// handle source ajax response and check for errors in response
					switch(type) {
						case 'facebook' : 
							if (typeof(resp.error) != udf)  {
								error = resp.errors.error_message;
							} else {
								resp = resp.data;
							}
							break;	
						
						case 'twitter' : 
							if(typeof(resp.errors) != udf) {
								error = resp.errors;
							}
							break;	
						
						case 'google' : // google+
							resp = resp.items;
							if(typeof(resp.error) != udf) {
								error = resp.error;
							}
							break;	
						
						case 'youtube': 
							if(typeof(resp.error) != udf)  {
								error = resp.error.message;
							} else {
								resp = resp.items;
							}
							
							break;
						
						case 'soundcloud': 
							if(typeof(resp.errors) != udf)  {
								error = resp.errors.error_message;
							} else {
								resp = resp;
							}
							break;
							
						case 'tumblr': 
							if(resp.meta.status == 200)  {
								resp = resp.response.posts;
							} else {
								error = resp.response;
							}
							break;

						default: // rss and pinterest

							if(resp.status == 'ok')  {
								resp = resp.items;
							} else {
								error = resp.message;
							}
							break;		 	
					}
					
					// debug trace
					if(error) {
						console.error([type, src, error]);	
						return false;
					}
					

					// manage items in response
					$.each(resp, function(i, news) {
						switch(type) {
							
							case 'facebook' : 
								var fix_time 	= news.created_time.replace('+0000', '+00:00'),
									d 			= new Date(fix_time),
									txt 		= (!news.message) ? news.description : news.message;
								
								// fix for elements not having texts
								var managed_data = (txt) ? man_feed_descr(txt, fixed_img, max_img_size, '', '', true) : {txt : '' , img : ''};
								
								// search post image
								if(!fixed_img) {
									if((news.type == 'photo' || news.type == 'video' || news.type == 'link') && typeof(news.attachments) != udf) {
										managed_data.img = news.attachments.data[0].media.image.src;
									}
									else if(news.type == 'photo'&& typeof(news.attachments) == udf) {
										managed_data.img = 'https://graph.facebook.com/'+ news.object_id +'/picture?type=normal&width=9999&height=9999';	
									}
									else if((news.type == 'link' || news.type == 'event') && typeof(news.picture) != udf) {
										managed_data.img = news.picture;	
									}
									
									// check against facebook safe-image small picures
									if(typeof(managed_data.img) == 'string' && managed_data.img.indexOf('safe_image.php') != -1) {
										managed_data.img = managed_data.img.replace(/130/g, 1000);
									}
								}
								
								var news_obj = {
									time	: d.getTime(),
									date 	: fix_time,
									title	: (typeof(news.name) == udf) ? '' : news.name,
									txt		: managed_data.txt.replace(url_exp, '<a href="$1">$1</a>'),
									link	: news.link,
									s_link	: news.link,
									img		: managed_data.img 
								};
								break;
								
								
							case 'twitter' :
								// IE fix	
								var fixed_date = news.created_at.replace(/^... (...) (..) (........) (...)(..) (....)$/, function(match, month, date, time, tz1, tz2, year) {
								  return year + "-" + {
									Jan: "01",
									Feb: "02",
									Mar: "03",
									Apr: "04",
									May: "05",
									Jun: "06",
									Jul: "07",
									Aug: "08",
									Sep: "09",
									Oct: "10",
									Nov: "11",
									Dec: "12"
								  }[month] + "-" + date + "T" + time + tz1 + ":" + tz2;
								});	
									
								var d = new Date(fixed_date);
								if(max_img_size) {
									img = img_loading_fix(img, max_img_size.w, max_img_size.h);
								}
								
								// image
								if(typeof(news.entities.media) != udf && typeof(news.entities.media[0]) != udf && news.entities.media[0].type == 'photo' && !fixed_img) {
									var img = news.entities.media[0].media_url_https;
								} 
								else {
									if(fixed_img) {var img = fixed_img;}
									else {
										var img = (typeof(src_opts.use_avatar) != udf && src_opts.use_avatar) ? news.user.profile_image_url : '';	
									}	
								}
								
								// link 
								if(typeof(news.entities.urls) != udf && typeof(news.entities.urls[0]) != udf) {
									var link 	= news.entities.urls[0].expanded_url,	
										s_link 	= link;
								} 
								else {
									// use tweek direct link - structure https://twitter.com/USERNAME/status/TWEET-ID
									var link = 'https://twitter.com/' + news.user.screen_name +'/status/'+ news.id_str,	
										s_link = '';
								}

								var news_obj = {
									time	: d.getTime(),
									date 	: fixed_date,
									title	: '',
									txt		: news.full_text.replace(url_exp, '<a href="$1">$1</a>'),
									link	: link,
									s_link  : s_link,
									img		: img.replace('_normal', ''),
									user_id	: settings.src[index].id,
									tweet_id: news.id_str
								}; 
								break;	
								
								
							case 'google' : // google+
								var fixed_date 	= news.published,
									d 			= new Date(fixed_date),
									img 		= (exclude.indexOf('image') != -1) ? '' : get_google_img(news, fixed_img);
								
								if(max_img_size) {
									img = img_loading_fix(img, max_img_size.w, max_img_size.h);
								}
								
								// get text
								var txt = (news.verb == 'share') ? news.annotation : news.object.content;
								
								var news_obj = {
									time	: d.getTime(),
									date 	: fixed_date,
									title	: '',
									txt		: txt,
									link	: news.url,
									s_link	: news.url,
									img		: img
								};
								break;	
								
								
							case 'youtube' : 
								var fixed_date = news.snippet.publishedAt,
									d = new Date(fixed_date),
								
									// find biggest image available
									video_thumb = (typeof(news.snippet.thumbnails.maxres) != udf) ? news.snippet.thumbnails.maxres.url : news.snippet.thumbnails.high.url,
									img = (fixed_img) ? fixed_img : video_thumb;
									
								if(max_img_size) {
									img = img_loading_fix(img, max_img_size.w, max_img_size.h);
								}
								
								// get video ID from thumbnail
								var thumb_url 	= video_thumb.replace('/maxresdefault.jpg', '').replace('/hqdefault.jpg', ''),
									thumb_arr 	= thumb_url.split('/'),
									link 		= 'https://www.youtube.com/watch?v='+ thumb_arr[thumb_arr.length-1],
								
									news_obj = {
										time	: d.getTime(),
										date 	: fixed_date,
										title	: news.snippet.title,
										txt		: news.snippet.description.replace(/\n/g, '<br/>').replace(url_exp, '<a href="$1">$1</a>'),
										link	: link,
										s_link	: link,
										img		: img
									};
								break;
								

							case 'soundcloud' : 
								var d = new Date(news.created_at);

								// iframe URL to embed
								var embed_url = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/'+ news.id +'&auto_play=true&hide_related=true&visual=true';
								
								// image
								var img = '';
								if(news.artwork_url) {
									img = news.artwork_url.replace('-large.', '-t500x500.');
								}
								else if (news.user.avatar_url) {
									img = news.user.avatar_url.replace('-large.', '-t500x500.');
								}

								var news_obj = {
									time	: d.getTime(),
									date 	: news.created_at,
									title	: news.title,
									txt		: news.description.replace(/\n/g, '<br/>').replace(url_exp, '<a href="$1">$1</a>'),
									link	: embed_url,
									s_link	: news.permalink_url,
									img		: img
								};
								break;	
								
								
							case 'tumblr' : 
								if(news.type != 'photo' && news.type != 'link' && news.type != 'text') {
									return true;
								}
								else {
									if(news.type == 'photo') {
										var title 	= '',
											link 	= news.short_url,
											n_data 	= man_feed_descr( $.trim(news.caption), 'foo', max_img_size, settings.src[index].strip_tags, settings.src[index].remove_tags, true),
											descr 	= n_data.txt,
											img 	= (fixed_img) ? fixed_img : news.photos[0].original_size.url;
										
										if(max_img_size) {
											img = img_loading_fix(img, max_img_size.w, max_img_size.h);
										}
									} 
									else if(news.type == 'link') {
										var title 		= news.title,
											link 		= news.url,
											txt_subj 	= ($.trim(news.description)) ? $.trim(news.description) : $.trim(news.excerpt),
											n_data 		= man_feed_descr(txt_subj, fixed_img, max_img_size, settings.src[index].strip_tags, settings.src[index].remove_tags, true),
											descr		= n_data.txt,
											img 		= n_data.img
										
										// get link photo
										if(typeof(news.photos) != udf) {
											img = news.photos[0].original_size.url;		
										}
									}
									else { // text type
										var title 	= news.title;
											link 	= news.short_url,
										
											n_data 	= man_feed_descr( $.trim(news.body), fixed_img, max_img_size, settings.src[index].strip_tags, settings.src[index].remove_tags, true),
											descr 	= n_data.txt,
											img 	= n_data.img;
									}
									
									var js_timestamp = news.timestamp * 1000;
									var news_obj = {
										time	: js_timestamp,
										date 	: new Date( (news.timestamp * 1000) ),
										title	: title,
										txt		: descr,
										link	: link,
										s_link	: (news.type == 'link') ? news.short_url : link,
										img		: img
									};
								}
								break;	
								
								
							case 'pinterest' : 
							default : // rss
							
								var d			= new Date(news.pubDate),
									img 		= (type == 'pinterest') ? news.thumbnail.replace('/192x/', '/550x/').replace('/236x/', '/550x/') : news.thumbnail,
									
									to_strip	= (type == 'pinterest') ? 'a:first-child' : settings.src[index].strip_tags,
									managed_data= man_feed_descr(news.content, fixed_img, max_img_size, to_strip, settings.src[index].remove_tags, true);
								
								if(max_img_size) {
									img = img_loading_fix(img, max_img_size.w, max_img_size.h);
								}
								
								// get text
								var news_obj = {
									time	: d.getTime(),
									date 	: news.pubDate,
									title	: news.title,
									txt		: managed_data.txt,
									link	: news.link,
									s_link	: news.link,
									img		: (fixed_img) ? fixed_img : img
								};
								break;		 	
						}
						
						
						// remove excluded elements
						if($.inArray('title', exclude) !== -1) 	{news_obj.title = '';}
						if($.inArray('link', exclude) !== -1) 	{news_obj.link = '';}
						if($.inArray('image', exclude) !== -1) 	{news_obj.img = '';} 
						
						
						// image required? check!
						if(settings.only_w_images && !news_obj.img) {
							return true;	
						}
						
						// common parameters
						news_obj.type 			= type;
						news_obj.link_target 	= src_opts.link_target;
						news_obj.author 		= (typeof(src_opts.author) == udf) ? false : src_opts.author
						
						// expanded mode images - custom setup
						var eim = (typeof(src_opts.exp_img_manag) != udf) ? src_opts.exp_img_manag : {};
						news_obj.exp_img_pos	= (typeof(eim.pos) != udf) ? eim.pos : false;
						news_obj.exp_img_w		= (typeof(eim.w) != udf) ? eim.w : false;
						news_obj.exp_img_h		= (typeof(eim.h) != udf) ? eim.h : false;
						
						// check if page URL needs to be used as sharing link
						if(typeof(src_opts.self_s_link) != udf && src_opts.self_s_link) {
							news_obj.s_link = location.href;
						}
						
						// if has text - add as proper news
						if(typeof(news_obj.txt) != udf && news_obj.txt != '') {
							vars.news_array.push(news_obj);
						}

						// having reached news limit - stop loop
						if( (vars.news_array.length - vars.inl_news_count) == (settings.max_news * (vars.fetches_done + 1) )) {
							return false;
						}
					});
					
					
					// once fetches are ended - process the final array
					if(vars.fetches_done == settings.src.length) {
						news_date_sort($lcnb_wrap_obj);	
					}
				}
			});
		};
		
		
		
		/* manage RSS description getting clean text and image */
		var man_feed_descr = function(raw_txt, fix_img, max_img_size, to_strip, to_remove, br_ify) {

			// image management before append - to avoid useless loading
			if(raw_txt.indexOf('<img') != -1) {
				if(typeof(to_remove) != udf && to_remove.indexOf("img") !== -1 && to_remove.indexOf("img:first") === -1 ) {
					raw_txt = img_loading_fix(raw_txt, max_img_size, true);
				} else {
					raw_txt = img_loading_fix(raw_txt, max_img_size);
				}
			}
			
			// create
			var $demo = $('<div />');
			
			// remove double spaces
			/*while( raw_txt.indexOf('\n\n') != -1 ) {
				raw_txt = raw_txt.replace(/\n\n/g, '\n');
			}*/
			
			if(typeof(br_ify) != udf && br_ify) {raw_txt = raw_txt.replace(/\n/g, '<br/>');}
			$demo.append('<div id="lcnb_util" style="display: none !important;">'+ raw_txt +'</div>');
			$('#lcnb_util').lcnb_unselfclose_iframes();
			
			if(!fix_img && $demo.find('#lcnb_util img').length) {
				var main_img = $demo.find('#lcnb_util img').first().attr('fake-src');
				$demo.find('#lcnb_util img').first().remove();	
			} else {
				var main_img = (max_img_size) ? img_loading_fix(fix_img, max_img_size.w, max_img_size.h) : fix_img;
			}

			// remove unwanted tags
			if(typeof(to_remove) != udf && to_remove && $.trim(to_remove).length > 0) { 
				var rm_blacklist = to_remove.split(',');
				$.each(rm_blacklist, function(i, v) { 
					$demo.find('#lcnb_util '+ v).remove();
				});
			}

			// strip unwanted tags
			if(to_strip == 'all') {
				$demo.find('#lcnb_util *').not('p, br, iframe').each(function() {
					var content = $(this).contents();
					$(this).replaceWith(content);
				});	
			}
			else if(typeof(to_strip) != udf && to_strip && $.trim(to_strip).length > 0) { 
				var strip_blacklist = to_strip.split(',');
				$.each(strip_blacklist, function(i, v) { 
					$demo.find('#lcnb_util '+v).each(function() {
                        var content = $(this).contents();
    					$(this).replaceWith(content);
                    });
				});	
			}
				
			// clean html and remove empty tags
			$demo.find('#lcnb_util *').removeAttr('style');
			$demo.find('*:empty').not('br, img, i, iframe').remove(); 
			
			// remove initial <br>, duplicated <br> and <br> after a paragraph
			for(x=0; x<5; x++) {
				// if first child is BR - remove it
				if($demo.find('#lcnb_util *:first').is('br')) {
					$demo.find('#lcnb_util *:first').remove();	
				}
				
				$demo.find('br').each(function() {
					/*if( $(this).next().is('br') ) {
						$(this).next().remove();	
					}*/
					if( $(this).prev().is('p')) {
						$(this).remove();
					}
				});
			}
			
			// get final text
			var clean_txt = $.trim( $demo.find('#lcnb_util').html());
			return {txt: $.trim(clean_txt), img : main_img};
		};
		
		
		
		/* get resized image url */
		var img_loading_fix = function(content, max_img_size, remove_images) {
			if(!content) {return content;}
			
			var img = [],
				fake = content;
			
			// create fake container and encapsulate images to avoid content loss
			var $fake = $('<div />');
			$fake.append('<div id="lcnb_fake_util" style="display: none !important;">'+ fake +'</div>');
			$fake.find('img').wrap('<span></span>');
			
			// replace <img tag with fake one
			var man_fake = $fake.find('#lcnb_fake_util').html();
			$fake.html('<div id="lcnb_fake_util" style="display: none !important;">'+ man_fake.replace(/<img/g, '<fake-img') +'</div>');
			
			// turn fake img into an image with fake source
			$fake.find('fake-img').each(function() {
				var src = $(this).attr('src');
				
				// check against facebook safe-image small picures
				if(typeof(src) != udf && src.indexOf('safe_image.php') != -1) {
					src = get_url_param(src, 'url');
				}
				
				$('<img fake-src="'+ src +'" />').insertBefore(this);
				$(this).remove();
			});

			// if will show images and they needs to be resized
			if(typeof(remove_images) == udf && max_img_size) {
				$fake.find('img').each(function() {
					var src = $(this).attr('fake-src');
					var new_url = lcnb_script_basepath + 'php_assets/img_size_check.php?src='+ encodeURIComponent(src) +'&max_w='+ max_img_size.w +'&max_h='+ max_img_size.h;
					$(this).attr('fake-src', new_url);
				});
			}

			return $fake.find('#lcnb_fake_util').html();
		}
		
		
		
		/* turn self-closed iframes into normal tags - prevent jQuery bug using .html() function */
		$.fn.lcnb_unselfclose_iframes = function() {
			 this.each(function() {
				$(this).find('iframe').each(function() {
					var $subj 		= $(this),
						code 		= '<iframe ',
						attributes 	= $subj.prop("attributes");
				
					$.each(attributes, function() {
						code += this.name +'="'+ this.value +'" ';
					});
					  
					$subj.replaceWith(code + '></iframe>');
				});
			});
			
			return this;
		};
		
		
		
		/* image url to resized one */
		var img_size_check_url = function(url, max_w, max_h) {
			if(parseInt(max_w) && parseInt(max_h)) {
				return lcnb_script_basepath + 'php_assets/img_size_check.php?src='+ encodeURIComponent(url) +'&max_w='+ max_w +'&max_h='+ max_h;	
			}
			else {return url;}
		};
		
		
		
		/* sort news by date */
		var news_date_sort = function(subj) {
			var vars = subj.data('lcnb_vars');
			
			if(vars.sorted_news.length == settings.max_news || vars.news_array.length == 0) {
				vars.news_count = vars.sorted_news.length;
				
				final_news_management();
				return true;	
			}
			else {
				var mr = {index: 0, time : 0};
				
				$.each(vars.news_array, function(i, v) {
					if(v.time > mr.time) {mr = {index: i, time : v.time};}
				});
				
				vars.sorted_news.push( vars.news_array[mr.index] );
				vars.news_array.splice(mr.index, 1);
				news_date_sort(subj);
			}
		};
		
		
		
		/* final news sorting and management */
		var final_news_management = function() {
			
			// check max news to show value
			if(settings.news_per_time > vars.news_count) {settings.news_per_time = vars.news_count;}

			// build
			$.each(vars.sorted_news, function(i, v) {
				var news_id = i +1; 

				//// buttons
				// social share
				if(settings.social_share == true) {
					var socials = social_share_code(v.type, v);
				} else {var socials = '';}	
				
				// link
				if(typeof(v.link) != udf && v.link != '') {
					 var trueLink = (v.type == 'soundcloud') ? v.s_link : v.link;
					 var link = '<div class="lcnb_link"><a href="'+ trueLink +'" target="_blank" title="check original source"></a></div>';
				} else {
					var link = '';
					if(settings.title_behavior == 'link')	{settings.title_behavior = 'none';}
					if(settings.img_behavior == 'link') 	{settings.img_behavior = 'none';}
				}

				// date
				if($.inArray('date', settings.hide_elements) === -1) {
					var visibility = (settings.read_more_btn) ? 'style="display: none;"' : '';
					var date = '<div class="lcnb_btn_time" '+visibility+'><time class="lcnb_date" pubdate="pubdate" datetime="'+ v.date +'">'+ date_format(v.date) +'</time></div>';
				} else {var date = '';}
				
				
				// read more button
				if(settings.read_more_btn && typeof(v.link) != udf && v.link != '') {
					var rm_btn = '<div class="lcnb_btn_time lcnb_rm_btn_wrap"><a class="lcnb_rm_btn" href="'+ trueLink +'">'+ settings.read_more_btn_txt +'</a></div>';
					link = '';
				} else {var rm_btn = '';}
				
				
				// expand news button
				if(settings.expandable_news == true) {
					var expand = '<div class="lcnb_btn_expand noSwipe" title="expand text"></div>';
				} else {
					var expand = '';
					if(settings.title_behavior == 'expand')	{settings.title_behavior = 'none';}
					if(settings.img_behavior == 'expand') 	{settings.img_behavior = 'none';}
				}	
				
				
				//// buttons position
				var side_btn = '', 
					top_box = '', 
					btm_box = '';
				
				if($.inArray('btn_bar', settings.hide_elements) === -1) {
					// side
					if(settings.buttons_position == 'side' && settings.layout == 'vertical' && settings.boxed_news) {
						if(
							settings.social_share == true || 
							link ||
							$.inArray('date', settings.hide_elements) === -1
						) {
							side_btn = '<div class="lcnb_buttons noSwipe">' + expand + link + socials + '</div>';
						}
					
						// date always in bottom position
						if($.inArray('date', settings.hide_elements) === -1 || rm_btn) {
							btm_box = '<div class="lcnb_btm_bar">' + date  + rm_btn + '</div>';
						} 
					}
					
					// top
					else if(settings.buttons_position == 'top') {
						if(
							settings.social_share == true || 
							link ||
							$.inArray('date', settings.hide_elements) === -1 ||
							rm_btn
						) {
							var top_box = '<div class="lcnb_top_bar">' + expand + socials + link + date + rm_btn + '</div>';
						}	
					}
					
					// bottom 
					else {
						if(
							settings.social_share == true || 
							link ||
							$.inArray('date', settings.hide_elements) === -1 ||
							rm_btn
						) {
							var btm_box = '<div class="lcnb_btm_bar">' + expand + socials + link + date + rm_btn + '</div>';
						}
					}
				}
				
				
				///////////////////////////
				// title
				if(v.title == '') {var title = '';}
				else {
					if(settings.title_behavior == 'link') {
						var title =  '<h3 class="lcnb_title"><a href="'+trueLink+'" class="lcnb_linked_title">'+ v.title +'</a></h3>';
					} else {
						var exp_class = (settings.title_behavior == 'expand') ? 'lcnb_expand_trig noSwipe' : '';
						var title =  '<h3 class="lcnb_title '+exp_class+'">'+ v.title +'</h3>';
					}
				}
				
				// author
				var author = (typeof(v.author) == udf || v.author == '') ? '' : '<span class="lcnb_author">'+ v.author +'</span> ';
					
				// save original text in array
				vars.excerpts[ i+1 ] = (typeof(v.excerpt) != udf) ? v.excerpt : '';
				vars.orig_texts[ i+1 ] = author + v.txt;
				
				
				// image - overlay with lightbox code
				var link_atts 	= '',
					lb_atts 	= '',
					lb_code 	= '';
				
				if( settings.img_behavior != 'none') {
					var ol_class = (v.type == 'youtube' || v.type == 'soundcloud') ? 'lcnb_video_lb' : 'lcnb_img_lb';		
					if(v.type == 'inline' && typeof(v.video) != udf) {
						ol_class = 'lcnb_video_lb';
					}
					
					if(settings.img_behavior == 'expand' && settings.expandable_news) {ol_class += ' lcnb_expand_trig';}
					if(settings.img_behavior == 'link') {ol_class += ' lcnb_linked_img';}
					
					if(v.type == 'youtube') 		{var lb_src =  v.s_link;}
					else if(v.type == 'soundcloud') {var lb_src = v.link;}
					else if(v.type == 'inline' && typeof(v.video) != udf) {var lb_src = v.video;}
					else {var lb_src = get_url_param(v.img, 'src');} // image lightbox
					
					if(lb_src) {
						link_atts 	= (settings.img_behavior == 'link') ? 'data-link="'+ trueLink +'" data-link-target="'+ v.link_target +'"' : '';
						lb_atts		= 'data-mfp-src="'+ lb_src +'"';
						lb_code 	= '<div class="lcnb_img_ol '+ ol_class +'"></div>';
					}
				} 
				
				var img = (typeof(v.img) == udf || !v.img) ? '' : 
					'<div class="lcnb_img lcnb_loading_img" '+ link_atts +' '+ lb_atts +'>'+
						lb_code +
						'<figure style="background-image: url(\''+ v.img +'\');"></figure>'+
						'<img src="'+ v.img +'" />'+
					'</div>';
				
				
				// contents box
				var box_txt = (typeof(v.excerpt) != udf && v.excerpt) ? v.excerpt : v.txt;
				var contents_box = 
				'<section class="lcnb_contents">'+
					'<div>'+
						'<div class="lcnb_contents_inner">'+ title +
							'<div class="lcnb_txt">'+ author + box_txt +'</div>'+
						'</div>'+
					'</div>'+
				'</section>';


				////////////////////////////
				// append news with boxes
				var pre_styles 		= 'style="opacity: 0; top: 30px;"',
					h_img_mode 		= (img && settings.layout == 'horizontal' && settings.horiz_img_mode) ? 'lcnb_h_img_mode' : '',
					img_mode_no_txt = (h_img_mode && !title) ? 'lcnb_him_no_txt' : '';
				
				
				var final_code = 
				'<article class="lcnb_news lcnb_type_'+ v.type +' '+ h_img_mode +' '+ img_mode_no_txt +'" '+ pre_styles +' rel="'+ news_id +'">'+
					'<div class="lcnb_news_inner">'+ 
						side_btn + img + 
						'<div class="lcnb_contents_wrap">'+ top_box + contents_box + btm_box +'</div>'+
					'</div>'+
				'</article>';
				
				
				// if specified link target management - perform
				if(typeof(v.link_target) != udf && v.link_target) {
					var $fake = $('<div>'+ final_code +'</div>');
					$fake.find('article a').attr('target', v.link_target);	
					
					final_code = $fake.html();
					$fake = false;	
				}
				
				// append and preload image
				$lcnb_wrap_obj.find('.lcnb_inner').append(final_code);

				// preload image
				if(img) {
					$lcnb_wrap_obj.find('.lcnb_news').last().lcnb_preload_img();	
				}

				// size, adjust and execute after every news has been processed
				if(i == (vars.news_count - 1)) {
					// if carousel - setup shown range and carousel clones
					if(settings.carousel) {
						carousel_clones();
					}
					
					size_boxes();	
					show_with_fx();
					
					if(settings.touchswipe) {
						lcnb_touchswipe();
					}
				}
			});
		};
		
		
		
		// Arrange items to be managed in carousel mode  
		var carousel_clones = function(after_scroll) {
			var $news_wrap 	= $lcnb_wrap_obj.find('.lcnb_inner');

			var $news 		= $news_wrap.find('.lcnb_news'),
				$clones		= $news.clone(),
				news_num 	= $news.length; 

			var $clone_wrap = $('<div></div>').append( $clones );

			$news_wrap.prepend( $clone_wrap.html() );
			$news_wrap.append( $clone_wrap.html() );

			for(a=0; a < news_num; a++) {
				$news_wrap.find('.lcnb_news:eq('+ a +'), .lcnb_news:eq('+ (a + (news_num * 2)) +')').addClass('lcnb_clone');	
			}

			// images preload	
			$news_wrap.find('.lcnb_clone').lcnb_preload_img();
		};

		

		/* show news with effects */
		var show_with_fx = function() {
			var settings 	= $lcnb_wrap_obj.data('lcnb_settings'),
				vars 		= $lcnb_wrap_obj.data('lcnb_vars');
			
			// preloader removal
			$lcnb_wrap_obj.find('.lcnb_wrap').removeClass('lcnb_loading');
			$lcnb_wrap_obj.find('.lcnb_cmd').css('opacity', 1);
			
			// show each news
			$lcnb_wrap_obj.find('.lcnb_news').not('.lcnb_clone').each(function(i, v) {
				var $news = $(this);
				
				setTimeout(function() { 
					$news.css({
						'opacity' 	: 1,
						'top'		: 0
					});
				}, (200 * i));
				
				setTimeout(function() {
					vars.is_shown = true;	
				}, (settings.news_per_time * 300));
			});	
			
			// show also clones
			$lcnb_wrap_obj.find('.lcnb_clone').css({
				'opacity' 	: 1,
				'top'		: 0
			});
			
			// autoplay
			if(settings.autoplay && vars.is_playing === false) {
				lcnb_start_slideshow($lcnb_wrap_obj);	
			}
		};
		 

		
		/* get google news image */
		var get_google_img = function(news, fix_img) {
			if(fix_img || typeof(news.object.attachments) == udf) {
				var img = '';
			} else {
				if(news.object.attachments[0].objectType == 'album') {
					var img = news.object.attachments[0].thumbnails[0].image.url;
				}
				else if(news.object.attachments[0].objectType == 'video') {
					var img = news.object.attachments[0].image.url;
				}
				else {
					if(typeof(news.object.attachments[0].fullImage.url) == udf || news.object.attachments[0].fullImage.url == '') {
						var img = news.actor.image.url.replace('?sz=50', '');
					} else {
						var img = news.object.attachments[0].fullImage.url;
					}
				}
			}
			
			return img;
		};

		
		
		/* preload images */
		$.fn.lcnb_preload_img = function() {
			this.each(function() {
				var $nb_obj = false;
				
				$(this).find('.lcnb_img').each(function() {
					 var $img = $(this);
					
					// get nb object to retrieve globals
					if(!$nb_obj) {
						$nb_obj = ($img.parents('.lcnb_wrap').length) ? $img.parents('.lcnb_wrap') : $('[data-lcnb-id="'+ $img.parents('.lcnb_mfp').attr('data-lcnb-instance') +'"]').find('.lcnb_wrap');	
					}   
	
					// get image's URL
					var bg = $(this).find('figure').css('background-image');
					if(!bg) {return true;}
					
					bg = bg.replace('url(','').replace(')','').replace(/\"/gi, "");
					
					$('<img />').bind("load", function() {
						$img.removeClass('lcnb_loading_img');
						
						// if is an expanded block - check its height
						if( $img.parents('.lcnb_exp_block').length ) {
							man_expanded_layout( $nb_obj );
						}
					}).attr('src', bg);
                });
			});
		};
		
		
		
		/* manage the date object */
		var date_format = function(utc_str) {
			var d = new Date(utc_str);
			
			// standard date 
			if(!settings.elapsed_time) {
				var clean_date = settings.date_format,
					formats = ['SS', 'MM', 'HHH', 'HH', 'H', 'dddd', 'ddd', 'dd', 'd', 'mmmm', 'mmm', 'mm', 'm', 'yyyy', 'yy'],
					prefix = '';

				// seconds
				if(clean_date.indexOf('SS') > -1) {
					prefix = (d.getSeconds() < 10) ? '0' : '';
					clean_date = clean_date.replace('SS', prefix + d.getSeconds());
				}
				
				// minutes
				if(clean_date.indexOf('MM') > -1) {
					prefix = (d.getMinutes() < 10) ? '0' : '';
					clean_date = clean_date.replace('MM', prefix + d.getMinutes());
				}
				
				// hour
				if(clean_date.indexOf('HHH') > -1) { // 12H format
					prefix = (d.getHours() >= 12) ? 'PM' : 'AM';
					clean_date = clean_date.replace('HHH', (d.getHours() % 12) +' '+ prefix); 
				}
				else if(clean_date.indexOf('HH') > -1) { // 00-23 format
					prefix = (d.getHours() < 10) ? '0' : '';
					clean_date = clean_date.replace('HH', prefix + d.getHours());
				}
				else if(clean_date.indexOf('H') > -1) { // 00-23 format
					clean_date = clean_date.replace('H', d.getHours());
				}
				
				// day
				if(clean_date.indexOf('dddd') > -1) { // monday-sunday format
					clean_date = clean_date.replace('dddd', settings.full_d_names[ d.getDay() ]);
				}
				else if(clean_date.indexOf('ddd') > -1) { // mon-sun format
					clean_date = clean_date.replace('ddd', settings.short_d_names[ d.getDay() ]);
				}
				else if(clean_date.indexOf('dd') > -1) { // 01-31 format
					prefix = (d.getDate() < 10) ? '0' : '';
					clean_date = clean_date.replace('dd', prefix + d.getDate());
				}
				else if(clean_date.indexOf('d') > -1) { // 1-31 format
					clean_date = clean_date = clean_date.replace('d', d.getDate());
				}
				
				// month
				if(clean_date.indexOf('mmmm') > -1) { // january-december format
					clean_date = clean_date.replace('mmmm', settings.full_m_names[ d.getMonth() ]);
				}
				else if(clean_date.indexOf('mmm') > -1) { // jan-dec formatt
					clean_date = clean_date.replace('mmm', settings.short_m_names[ d.getMonth() ]);
				}
				else if(clean_date.indexOf('mm') > -1) { // 01-12 format
					prefix = ((d.getMonth() + 1) < 10) ? '0' : '';
					clean_date = clean_date.replace('mm', prefix + (d.getMonth() + 1));
				}
				else if(clean_date.indexOf('m') > -1) { // 1-12 format
					clean_date = clean_date.replace('m', (d.getMonth() + 1));
				}
				
				// year
				if(clean_date.indexOf('yyyy') > -1) { // four digits format
					clean_date = clean_date.replace('yyyy', d.getFullYear());
				}
				else if(clean_date.indexOf('yy') > -1) { // two digits format
					var full_y = d.getFullYear().toString();
					clean_date = clean_date.replace('yy', full_y.substr(2));
				}
			}
			
			//elapsed time
			else {
				var n = new Date();
				var diff = Math.ceil( (n.getTime() - d.getTime()) / 1000);
				
				// posted seconds ago
				if		(diff < 60) {
					var clean_date = diff +' '+ settings.elapsed_names[1];
				}
				
				// posted one minute ago
				else if (diff >= 60 && diff < 120) {
					var clean_date = '1 ' + settings.elapsed_names[2];
				}
				
				// posted minutes ago
				else if (diff < 3600) {
					var val = Math.floor( diff / 60); 
					var clean_date = val +' '+ settings.elapsed_names[3];
				}
				
				// posted one hour ago
				else if (diff >= 3600 && diff < 7200) {
					var clean_date = '1 ' + settings.elapsed_names[4];
				}
				
				// posted hours ago
				else if (diff < 86400) {
					var val = Math.floor( (diff / 60) / 60 ); 
					var clean_date = val +' '+ settings.elapsed_names[5];
				}
				
				// posted one day ago
				else if (diff >= 86400 && diff < 172800) {
					var clean_date = '1 ' + settings.elapsed_names[6];
				}
				
				// posted days ago
				else if (diff < 604800) {
					var val = Math.floor( ((diff / 60) / 60) / 24 );
					var clean_date = val +' '+ settings.elapsed_names[7];
				}
				
				// posted one week ago
				else if (diff >= 604800 && diff < 1209600) { 
					var clean_date = '1 ' + settings.elapsed_names[8];
				}
				
				// posted weeks ago - max 4 weeks
				else if (diff < 2592000) { 
					var val = Math.floor( (((diff / 60) / 60) / 24) / 7 );
					var clean_date = val +' '+ settings.elapsed_names[9];
				}
				
				// posted one month ago
				else if (diff >= 2592000 && diff < 5184000) {
					var clean_date = '1 ' + settings.elapsed_names[10];
				}
				
				// posted months ago
				else {
					var val = Math.floor( (((diff / 60) / 60) / 24) / 30 );
					var clean_date = val +' '+ settings.elapsed_names[11];
				}

				clean_date = clean_date +' '+ settings.elapsed_names[0];
			}
			
			return clean_date;
		};
			
			
		
		/* size boxes */	
		var size_boxes = function(forced_per_time) {
			var settings = $lcnb_wrap_obj.data('lcnb_settings'),
				 	vars = $lcnb_wrap_obj.data('lcnb_vars');
					
			if(typeof(vars) == udf) {return false;}
			
			var $news_wrap = $lcnb_wrap_obj.find('.lcnb_wrap'),
				$news_box = $news_wrap.find('.lcnb_news'),
				pp = (typeof(forced_per_time) == udf) ? settings.news_per_time : forced_per_time;
			
			// paginated news? show commands
			(vars.news_count <= pp) ? $news_wrap.removeClass('lcnb_has_cmd') : $news_wrap.addClass('lcnb_has_cmd');	
			
			
			// setup inline CSS code
			var css_code 	= '',
				id 			= $news_wrap.attr('id'),
				selector 	= '#'+ id;
			
			// reset 
			$('#'+id+'-css').remove();
			
			
			var is_horizontal		= $news_wrap.hasClass('lcnb_horizontal'),
				is_uniblock			= $news_wrap.hasClass('lcnb_uniblock'),
				wrap_w 				= Math.round($news_wrap.width()),
				wrap_h 				= settings.height,
				
				box_l_border		= (is_uniblock) ? get_int( $news_box.first().css('border-left-width')) : 0,
				box_l_margin 		= (is_uniblock) ? 0 : get_int( $news_box.first().css('margin-left')),
				box_r_margin 		= (is_uniblock) ? 0 : get_int( $news_box.first().css('margin-right')),
				box_horiz_margins	= box_l_margin + box_r_margin,
				
				box_t_border		= (is_uniblock) ? get_int( $news_box.first().css('border-top-width')) : 0,
				box_t_margin 		= (is_uniblock) ? 0 : get_int( $news_box.first().css('margin-top')),
				box_b_margin 		= (is_uniblock) ? 0 : get_int( $news_box.first().css('margin-bottom')),
				box_vert_margins	= box_t_margin + box_b_margin;
			
			
			//////////////////////////////
			// horizontal layout
			if(is_horizontal) {
				var box_w = (wrap_w / pp) - box_horiz_margins;
				
				// box width
				if(box_w < settings.min_news_w && pp > 1)	{
					size_boxes( pp - 1 );
					return false;
				} else {
					var w = Math.floor(box_w);
				}
				
				// if boxes total width is smaller than wrapper - add margin to avoid overflow issues 
				var shown_news_w = pp * (w + box_horiz_margins);
				if(is_uniblock) {
					var items_count 	= (settings.carousel) ? (pp * 3) : vars.news_count;
					shown_news_w = shown_news_w - (box_l_border * (pp - 1));
				}
				
				if(wrap_w > shown_news_w) {
					css_code += selector +' {max-width: '+ ( Math.round($news_wrap.outerWidth()) - (wrap_w - shown_news_w)) +'px !important;}';	
				}
				
				vars.news_w = w;
				vars.news_to_show = pp;
			}
			
			
			//////////////////////////////
			// vertical layout
			else {
				var box_h = (wrap_h / pp) - box_vert_margins;
				
				// box width
				if(box_h < settings.min_news_h && pp > 1)	{
					size_boxes( pp - 1 );
					return false;
				} else {
					var h = Math.floor(box_h);
				}
				
				// if boxes total width is smaller than wrapper - add margin to avoid overflow issues 
				var shown_news_h = pp * (h + box_vert_margins);
				if(is_uniblock) {
					var items_count 	= (settings.carousel) ? (pp * 3) : vars.news_count;
					shown_news_h = shown_news_h - (box_t_border * (pp - 1));
				}
				
				if(wrap_h > shown_news_h) {
					css_code += selector +':not(.lcnb_expanded_mode), '+ selector +':not(.lcnb_expanded_mode) .lcnb_inner_wrapper {max-height: '+ ( Math.round($news_wrap.outerHeight()) - (wrap_h - shown_news_h)) +'px;}';	
				}
				
				vars.news_h = h;
				vars.news_to_show = pp;
			}
			
			
			//////////////////
			// text block height
			if(is_horizontal) {
				css_code += selector +' .lcnb_contents {max-height: none;}';
				css_code += selector +' .lcnb_contents > * {height: auto;}';
			} 
			else {
				var cont_h = h - ($news_box.outerHeight(true) - $news_box.height());
				css_code += selector +' .lcnb_contents {max-height: '+ cont_h +'px;}';

				var txt_h = cont_h - $news_box.find('.lcnb_btm_bar, .lcnb_top_bar').outerHeight(true) - 
									 ($news_box.find('.lcnb_contents').outerHeight(true) - $news_box.find('.lcnb_contents').height());
			}
			
			
			// box height
			css_code += selector +' .lcnb_news_overflow {height: '+ settings.height +'px;}';
			
			// size boxes
			css_code += (is_horizontal) ? selector +' .lcnb_news {width: '+ w +'px;}' : selector +' .lcnb_news {height: '+ h +'px;}';

			
			// set image sizes
			if(settings.horiz_img_h && !settings.horiz_img_mode) {
				css_code += selector +'.lcnb_horizontal .lcnb_img {height: '+ settings.horiz_img_h +'px;}';
			}
			if(settings.vert_img_w) {
				css_code += selector +'.lcnb_vertical .lcnb_img {width: '+ settings.vert_img_w +'px; max-width: '+ settings.vert_img_w +'px;}';
			}
			
			
			
			// expanded in lightbox?
			if(settings.exp_in_lightbox) {
				css_code += '.lcnb_exp_in_lb[data-lcnb-instance="'+ vars.box_id +'"] .mfp-content {width: calc('+ settings.exp_lb_w +' - 130px); max-width: calc('+ settings.exp_lb_max_w +'px - 130px);}';	
			}
			
			
			///////////////////////////
			// has got pagination?
			if(pp < vars.news_count) {
							
				var sizing_unit 		= (is_horizontal) ? w : h,
					margins_unit 		= (is_horizontal) ? box_horiz_margins : box_vert_margins;
					ublock_border_trick = (is_uniblock) ? box_l_border : 0; // uniblock? count the negative margin due to the border	
						
				// is carousel?
				if(settings.carousel) {
					var wrap_size 	= (sizing_unit * (vars.news_count * 3)) + (margins_unit * (vars.news_count * 3)) - (ublock_border_trick * ((vars.news_count * 3) - 1)),
						wrap_margin	= ((sizing_unit + margins_unit) * vars.news_count) - (ublock_border_trick * vars.news_count);
											
					css_code += (is_horizontal) ? 
						selector+' .lcnb_inner {width: '+ wrap_size +'px; margin-left: -'+ wrap_margin +'px;}' : 
						selector+' .lcnb_inner {height: '+ wrap_size +'px !important; margin-top: -'+ wrap_margin +'px;}';
				}
				
				// normal pagination
				else {
					var wrap_size = (sizing_unit * vars.news_count) + (margins_unit * vars.news_count) - (ublock_border_trick * (vars.news_count - 1));
					
					css_code += (is_horizontal) ? 
						selector+' .lcnb_inner {width: '+ wrap_size +'px;}' : 
						selector+' .lcnb_inner {height: '+ wrap_size +'px !important;}';
				}		
			}
			
			$('head').append('<style type="text/css" id="'+id+'-css">'+ css_code +'</style>');
			
			
				
			// image mode - set image's height proportionally with the rest
			if(is_horizontal && settings.horiz_img_mode) {
				$news_wrap.find('.lcnb_h_img_mode').each(function() {
					
					$(this).find('.lcnb_img').css('bottom', $(this).find('.lcnb_contents_wrap').outerHeight());
				});
			}
			
			
			// text shortening
			setTimeout(function() {
				news_txt_shortening(); 
			}, 50);
			
			
			
			/************/
			// SPECIFIC BROWSER - CSS FIXES
			var is_ie10 = (navigator.appVersion.indexOf("MSIE 10") !== -1) ? true : false,
				is_ie11 = (navigator.userAgent.indexOf("Trident") !== -1 && navigator.userAgent.indexOf("rv:11") !== -1) ? true : false;

			var ua = navigator.userAgent.toLowerCase(),
				is_win_safari = (ua.indexOf("safari/") !== -1 && ua.indexOf("windows") !== -1 && ua.indexOf("chrom") === -1) ? true : false;

			// IE10/11 - fix image size in vertical mode
			if(!$('#lcnb-old-ie-css-fix').length && (is_ie10 || is_ie11)) {
				$('head').append(
				'<style type="text/css" id="lcnb-old-ie-css-fix">'+
					'.lcnb_vertical .lcnb_news_inner .lcnb_img img {min-height: 100% !important; position: relative !important;}'+
				'</style>');	
			}
			
			
			// IE11 - vertical buttons mode - fix socials box
			if(!$('#lcnb-ie11-vb-socials-css-fix').length && is_ie11) {
				$('head').append(
				'<style type="text/css" id="lcnb-ie11-vb-socials-css-fix">'+
					'.lcnb_vertical .lcnb_buttons .lcnb_social_box {transform: translateY(0);}'+
				'</style>');		
			}
			
			
			// IE10/win_saf - vertical mode - fix side button sizes
			setTimeout(function() {
				if(!$('#'+id+'-ie10-vb-css-fix').length && $('#'+id+' .lcnb_buttons > div').length && (is_ie10 || is_win_safari)) {
					
					$('head').append(
					'<style type="text/css" id="'+id+'-ie10-vb-css-fix">'+
						'#'+id+' .lcnb_buttons > div  {'+
							'display: inline-block;'+
							'height: '+ ($('#'+id+' .lcnb_news').first().height() / 3) +'px;'+
					'}</style>');	
				}
			}, 50);
		};
		


		/* news text lenght control - text shortening */
		var news_txt_shortening = function() {
			var $news_wrap 	= $lcnb_wrap_obj.find('.lcnb_wrap'),
				settings 	= $lcnb_wrap_obj.data('lcnb_settings'),
				vars 		= $lcnb_wrap_obj.data('lcnb_vars'),
				global_h 	= $lcnb_wrap_obj.find('.lcnb_news').first().height() - 17;	
				
			$lcnb_wrap_obj.find('.lcnb_news').not('.lcnb_clone').each(function() {

				var nid 		= parseInt( $(this).attr('rel'), 10),
					$news_box	= $(this),
					wrap_h		= global_h
					$incl_clones= $news_wrap.find('.lcnb_news[rel='+ nid +']'), // operate once for clones
					author 		= ( $news_box.find('.lcnb_txt .lcnb_author').length) ? $news_box.find('.lcnb_txt .lcnb_author').clone().wrap('<div>').parent().html() : '';	

		
				// clean empty elements in description
				$news_box.find('.lcnb_txt *:empty, .lcnb_txt iframe').not('br, img, i').remove();

				// set global var with orig texts
				var $news_txt = $news_box.find('.lcnb_txt');		
				if(typeof(vars.orig_texts[nid]) == udf) {
					vars.orig_texts[nid] = $news_txt.html();
				}
				
				// reset
				if($news_box.find('.lcnb_shorten').length) {
					var reset_txt = (vars.excerpts[nid]) ? author + vars.excerpts[nid] : vars.orig_texts[nid];
					$incl_clones.find('.lcnb_txt').html(reset_txt).removeClass('lcnb_shorten');
				}

				// horizontal - calculate sizes
				if($news_wrap.hasClass('lcnb_horizontal')) {
					
					if($news_box.find('.lcnb_img').length) {
						wrap_h = wrap_h - $news_box.find('.lcnb_img').outerHeight(true);	
					}
					if($news_box.find('.lcnb_btm_bar, .lcnb_top_bar').length) {
						wrap_h = wrap_h - $news_box.find('.lcnb_btm_bar, .lcnb_top_bar').outerHeight(false);	
					}
					
					var txt_h = Math.round( $news_box.find('.lcnb_contents').height());
				}
				
				// vertical - calculate sizes
				else {
					var txt_h = parseInt( $news_box.find('.lcnb_contents_inner').outerHeight(), 10);

					wrap_h = wrap_h - get_int( $news_box.find('.lcnb_contents').css('padding-bottom')); // ignore top as mere spacer
					
					if($news_box.find('.lcnb_title').length) {
						wrap_h = wrap_h - parseInt( $news_box.find('.lcnb_title').outerHeight(true), 10);
					}

					if($news_box.find('.lcnb_btm_bar, .lcnb_top_bar').length) {
						wrap_h = wrap_h - parseInt( $news_box.find('.lcnb_btm_bar, .lcnb_top_bar').outerHeight(true), 10);
					}
				}
					
				// if is higher, act
				if(wrap_h >= txt_h) {
					return true;	
				}
				else {
					if(author) {
						$news_box.find('.lcnb_txt .lcnb_author').remove();
					}
					
					// check for cached contents
					if(typeof(vars.clean_texts[nid]) != udf) {
						var orig_contents = vars.clean_texts[nid];	
					}
					else {
					
						// leave only paragraphs and links to avoid slowdowns
						$news_box.find('.lcnb_txt *').not('a, p, br, i, iframe').each(function() {
							var content = $(this).contents();
							$(this).replaceWith(content);
						});
						
						// clean the attribues
						$news_box.find('.lcnb_txt *').lcnb_remove_all_attr();
					
						var orig_contents = $news_box.find('.lcnb_txt').html();	
						vars.clean_texts[nid] = orig_contents;
					}
					
					var	exploded	  = orig_contents.split(' '),
						new_contents  = '',
						right_h_txt   = '';
					
					var txt_h = 0;
					var a = 0;

					while(txt_h < wrap_h && a < exploded.length) {
						
						if( typeof(exploded[a]) != udf) {
							right_h_txt = new_contents;
							new_contents = new_contents + exploded[a] + ' ';	
							
							// append and clean	
							$news_box.find('.lcnb_txt').html(author + new_contents + '<span class="lcnb_read_more">'+ settings.read_more_txt +'</span>');	
							
							// remove initial <br>, duplicated <br> and <br> after a paragraph
							for(x=0; x<2; x++) {
								// if first child is BR - remove it
								if($news_box.find('.lcnb_txt > *:first').is('br')) {
									$news_box.find('.lcnb_txt > *:first').remove();	
								}
								
								$news_box.find('.lcnb_txt br').each(function() {
									if( $(this).prev().is('p')) {
										$(this).remove();
									}
								});
							}
							
							// remove BR before the "read more" text
							while( $news_box.find('.lcnb_txt').html().indexOf('<br\> <span class="lcnb_read_more">') != -1 ) {
								$news_box.find('.lcnb_read_more').prev().remove();	
							}

							txt_h = ($news_wrap.hasClass('lcnb_horizontal')) ? $news_box.find('.lcnb_contents').height() : $news_box.find('.lcnb_txt').height();
							a++;
						}
					}
					
					
					// check unclosed tags 
					var tags = ['a', 'p', 'i'];
					$.each(tags, function(i, v) {
						var open_count = right_h_txt.match('<'+v, 'g');  
						var close_count = right_h_txt.match('</'+v, 'g');
						
						if(open_count != null) {
							if(open_count != null && close_count == null || open_count.length > close_count.length) {
								right_h_txt = right_h_txt + '</'+ v +'>';
							}
						}
						
						if(i == (tags.length - 1)) {
							$news_box.find('.lcnb_txt').html(author + right_h_txt + '<span class="lcnb_read_more">'+ settings.read_more_txt +'</span>');	
							$news_box.find('.lcnb_txt *:empty').not('br').remove();
							
							// remove duplicated <br> and <br> after a paragraph
							for(x=0; x<2; x++) {
								// if first child is BR - remove it
								if($news_box.find('.lcnb_txt > *:first').is('br')) {
									$news_box.find('.lcnb_txt > *:first').remove();	
								}
								
								$news_box.find('.lcnb_txt br').each(function() {
									if( $(this).next().is('br') ) {
										$(this).next().remove();	
									}
									if( $(this).prev().is('p')) {
										$(this).remove();
									}
								});
							}
							
							// remove BR before the "read more" text
							while( $news_box.find('.lcnb_txt').html().indexOf('<br\> <span class="lcnb_read_more">') != -1 ) {
								$news_box.find('.lcnb_read_more').prev().remove();	
							}
						}
					});

					// last P tag fix
					$news_box.find('.lcnb_txt p').last().replaceWith( $news_box.find('.lcnb_txt p').last().html() );

					// replicate the same also for clones
					var final_txt = $news_box.find('.lcnb_txt').html();
					$news_wrap.find('.lcnb_clone[rel='+ nid +']').find('.lcnb_txt').html(final_txt);
					
					// save the real text and add class
					$incl_clones.find('.lcnb_txt').addClass('lcnb_shorten');
				}
			});
		};
			
		
		
		/* remove all the tags attributes except the link href and target */
		$.fn.lcnb_remove_all_attr = function() {
			return this.each(function() {
				var attributes = $.map(this.attributes, function(item) {
				  return item.name;
				});
				
				var obj = $(this);
				$.each(attributes, function(i, item) {
					if( item != "href" && item != "target") {
						obj.removeAttr(item);
					}
				});
			});
		};
		
		
			
		/* dynamic box layout */
		var dynamic_layout = function() {
			var settings = $lcnb_wrap_obj.data('lcnb_settings'),
				$news_wrap = $lcnb_wrap_obj.find('.lcnb_wrap'),
				min_w = (settings.min_horiz_w < settings.min_news_w) ? settings.min_news_w : settings.min_horiz_w;
	
			// horizontal to vertical
			if($news_wrap.width() < min_w) {
				if($news_wrap.hasClass('lcnb_horizontal')) {
					$news_wrap.removeClass('lcnb_horizontal').addClass('lcnb_vertical');	
					vars.news_to_show = settings.news_per_time;
					
					if(settings.touchswipe) {
						lcnb_touchswipe(true);
					}
				}
			}
			
			// vertical to Horizontal
			else {
				if(settings.layout == 'horizontal' && !$news_wrap.hasClass('lcnb_horizontal')) {
					$news_wrap.removeClass('lcnb_vertical').addClass('lcnb_horizontal');
					vars.news_to_show = settings.news_per_time;
					
					if(settings.touchswipe) {
						lcnb_touchswipe(true);
					}
				}
			}
			
			return true;
		};
		
			
		
		/* get the current news element size (with margins) - returns width in horozontal layout and height in vertical */
		var get_news_size = function($subj) {
			var vars 		= $subj.data('lcnb_vars'),
				$news_wrap 	= $('.lcnb_wrap', $subj),
				$news_box 	= $('.lcnb_news', $subj).first();
		
			// box sizes
			if($news_wrap.hasClass('lcnb_horizontal')) {
				var size = vars.news_w + get_int( $news_box.css('margin-left')) + get_int( $news_box.css('margin-right')); 
				if($news_wrap.hasClass('lcnb_uniblock')) {
					size = size - get_int( $news_wrap.find('.lcnb_news').css('border-left-width'));
				}
			} 
			else {
				var size = vars.news_h + get_int( $news_box.css('margin-top')) + get_int( $news_box.css('margin-bottom')); 
				if($news_wrap.hasClass('lcnb_uniblock')) {
					size = size - get_int( $news_wrap.find('.lcnb_news').css('border-top-width'));
				}	 
			}
			
			return size;
		};
			
		
		
		// re set the wrapper margin after box has been resized
		var set_scroll_margin_after_resize = function($subj) {
			var vars 		= $subj.data('lcnb_vars'),
				$inner_wrap = $('.lcnb_inner', $subj),
				news_size	= get_news_size($subj);
			
			// calculae offset basing on the fist shown news
			var offset = news_size * (vars.first_shown - 1) * -1;
			vars.curr_box_margin = offset;
			 
			if($('.lcnb_wrap', $subj).hasClass('lcnb_horizontal')) {
				$inner_wrap.clearQueue().css('margin-left', offset);
			} else {
				$inner_wrap.clearQueue().css('margin-top', offset);
			}
		};
		


		/* Manage news sliding (only clicking on buttons)
		 *
		 * direction (string) 	= next/prev
		 * scrolled_news (int) 	= how many news to scroll? (by default is 1)
		 */
		lcnb_news_slide = function($subj, direction, scrolled_news, on_swipe) {
			
			var vars 		= $subj.data('lcnb_vars'),
				settings 	= $subj.data('lcnb_settings'),
				$news_wrap 	= $('.lcnb_wrap', $subj),
				$inner_wrap = $('.lcnb_inner', $subj),
				
				is_horizontal 	= ($news_wrap.hasClass('lcnb_horizontal')) ? true : false,
				news_size		= get_news_size($subj),
				easing 			= (settings.slideshow_time == 0 && vars.is_playing) ? 'linear' : 'swing',
				duration 		= (typeof(on_swipe) != udf) ? 350 : settings.animation_time;
				
			if(vars.is_expanded) {
				duration = 0;	
			}

			// preventive checks
			if(vars.is_moving || vars.news_to_show >= vars.news_count) {
				return false;	
			}
			if(
				!settings.carousel && 
				(
					(vars.first_shown === 1 && direction == 'prev') || 
					((vars.first_shown + vars.news_to_show) > vars.news_count && direction == 'next')
				)
			) {
				return false;		
			}
			
			
			// by default we scroll only one news
			if(typeof(scrolled_news) == udf) {
				scrolled_news = 1;	
			}
			
			
			// be sure we are not scrolling too much
			if(!settings.carousel && direction == 'next' && (vars.first_shown + scrolled_news + vars.news_to_show - 1) > vars.news_count) {
				scrolled_news = scrolled_news - ((vars.first_shown + scrolled_news + vars.news_to_show - 1) - vars.news_count);	
			}

			// how much have to scroll
			var to_scroll = news_size * scrolled_news;
			
			// calculate new margins
			var curr_margin = (settings.carousel) ? (vars.news_count * news_size * - 1) : vars.curr_box_margin;
				new_margin 	= (direction == 'next') ? curr_margin - to_scroll : curr_margin + to_scroll;
				
				vars.curr_box_margin = new_margin;


			// be sure to not go in positive margin
			if(new_margin > 0) {
				new_margin = 0;	
			}

			
			// set new first shown if no carousel
			if(!settings.carousel) {
				var old_first_shown = vars.first_shown; 
				vars.first_shown 	= (direction == 'next') ? vars.first_shown + scrolled_news : vars.first_shown - scrolled_news; 
				
				if(vars.first_shown < 1) {vars.first_shown = 1;}
				if(vars.first_shown > (vars.news_count - vars.news_to_show)) {vars.first_shown = (vars.news_count - vars.news_to_show + 1);}
			}
			
			
			// perform slide
			if(is_horizontal) {
				$inner_wrap.clearQueue().animate(
					{'margin-left' : new_margin}, 
					duration, 
					easing
				);
			} 
			else {
				$inner_wrap.clearQueue().animate(
					{'margin-top' : new_margin}, 
					duration, 
					easing
				);
			}
			
			
			// if is expanded mode, change what is seen
			if(vars.is_expanded) {
				var $wrapper = $('.lcnb_inner_wrapper', $subj);
				
				if(direction == 'next') {
					var $next = $wrapper.find('.expanded').next('.lcnb_news');	
					expand_news($wrapper, $next, true);
				} else {
					var $prev = $wrapper.find('.expanded').prev('.lcnb_news');	
					expand_news($wrapper, $prev, true);
				}
			}


			// nav arrows visibility
			if(!settings.carousel) {
				arrows_visibility($subj);
			}	
						
			
			// setup moving flag
			var delay = (duration) ? duration - 10 : 0; // use -10 to allow seamless continuous sliding 
			vars.is_moving = true;
			
			setTimeout(function() {
				vars.is_moving = false;
				
				// once animation ended - reset carousel clones
				if(settings.carousel) {
					// manage "clone" classes
					if(direction == 'next') {
						
						$inner_wrap.find('.lcnb_clone').slice(vars.news_count, (vars.news_count + scrolled_news)).removeClass('lcnb_clone');
						$inner_wrap.find('.lcnb_news').not('.lcnb_clone').slice(0, scrolled_news).addClass('lcnb_clone');

						var $detached = $inner_wrap.find('.lcnb_clone').slice(0, scrolled_news);
						$inner_wrap.append( $detached );
					}	
					
					else {
						$inner_wrap.find('.lcnb_clone').slice( (vars.news_count - scrolled_news), vars.news_count).removeClass('lcnb_clone');
						$inner_wrap.find('.lcnb_news').not('.lcnb_clone').slice( (vars.news_count - scrolled_news) , vars.news_count).addClass('lcnb_clone');

						var $detached = $inner_wrap.find('.lcnb_clone').slice( ($inner_wrap.find('.lcnb_clone').length - scrolled_news) , $inner_wrap.find('.lcnb_clone').length);
						$inner_wrap.prepend( $detached );
					}

					// reset style
					var h = $inner_wrap.height();
					$inner_wrap.stop().removeAttr('style');
					$inner_wrap.css('height', h);
				}				
			}, delay);
		};
		
		
		
		
		/* navigation arrows visibility */
		var arrows_visibility = function($subj) {
			var vars	= $subj.data('lcnb_vars'),
				$wrap 	= $subj.find('.lcnb_wrap');
				
				
			// already showing every news? hide commands
			(vars.news_to_show >= vars.news_count) ? $wrap.removeClass('lcnb_has_cmd') : $wrap.addClass('lcnb_has_cmd');
			
			// first one shown - disable prev	
			if(vars.first_shown === 1) {
				$('.lcnb_prev', $subj).addClass('lcnb_disabled');
				$('.lcnb_next', $subj).removeClass('lcnb_disabled');	
			}
			
			// we are in the midddle - enable both
			else if( (vars.first_shown + vars.news_to_show) <= vars.news_count) {
				$('.lcnb_prev, .lcnb_next', $subj).removeClass('lcnb_disabled');
			}
			
			// end reached - show only prev
			else {
				$('.lcnb_prev', $subj).removeClass('lcnb_disabled');
				$('.lcnb_next', $subj).addClass('lcnb_disabled');	
			}
		};
		
		
		
		/* start the slideshow */
		lcnb_start_slideshow = function($elem, find_the_wrap) {
			if(typeof(find_the_wrap) != udf) {	
				$elem = $elem.parents('.lcnb_wrap').parent();
			} 

			var vars 		= $elem.data('lcnb_vars'),	
				settings 	= $elem.data('lcnb_settings'),
				add_delay 	= (settings.slideshow_time == 0 && !vars.is_shown) ? 1200 : 0,
				to_slide = (settings.slide_all && settings.slideshow_time > 0) ? vars.news_to_show : 1;
			
			// if is expanded or already playing - do nothing
			if(vars.is_expanded || vars.is_playing) {return true;}
			
			// start immediately if slideshow time == 0 
			if(settings.slideshow_time == 0) {
				setTimeout(function() {
					vars.is_playing = true;
					lcnb_news_slide($elem, 'next', to_slide);	
				}, add_delay);
			}
			
			setTimeout(function() {
				vars.is_playing = setInterval(function() {
					
					var to_slide = (settings.slide_all && settings.slideshow_time > 0) ? vars.news_to_show : 1;
					lcnb_news_slide($elem, 'next', to_slide);

				}, (settings.slideshow_time + settings.animation_time));	
			}, add_delay + 10);
		};
		
		
		
		/* stop the slideshow */
		var stop_slideshow = function($elem, elem_is_wrapper) {
			if(typeof(elem_is_wrapper) == udf) {	
				$elem = $elem.parents('.lcnb_wrap').parent();
			} 

			var vars 		= $elem.data('lcnb_vars'),	
				settings 	= $elem.data('lcnb_settings');
			
			clearInterval(vars.is_playing);
			vars.is_playing = null;
			
			// limit animation time for manual changes
			if(settings.autoplay && settings.slideshow_time == 0 && settings.animation_time > 1800) {
				var orig_time = settings.animation_time;
				settings.animation_time = 1800;
				
				// return to normal animation time
				setTimeout(function() {
					settings.animation_time = orig_time;	
				}, 200);
			}
		};
		
		
		
		/* pause on hover */
		if(settings.autoplay && settings.pause_on_hover) {
			$lcnb_wrap_obj.on('mouseenter', '.lcnb_inner_wrapper', function() {
				$(this).parents('.lcnb_wrap').parent().lcsb_stop_slideshow();
			})
			.on('mouseleave', '.lcnb_inner_wrapper', function() {
				$(this).parents('.lcnb_wrap').parent().lcsb_start_slideshow();
			});
		}
		


		/* html to tweet text */ 
		var html_to_tweet = function(txt) { 
			// strip text
			var $demo = $('<div/>');	
			$demo.append('<div id="lcnb_util_2" style="display: none !important;">'+ txt +'</div>');
			
			$demo.find("*").not('iframe').each(function() {
				var content = $(this).contents();
				$(this).replaceWith(content);
			});
			
			// get the short text
			var short_txt = $demo.text().replace(/[^ -~]/g, '').substring(0, 117);
			return encodeURIComponent(short_txt).replace(/'/g,"\\'");
		};
		
		
		
		/* social share code */
		var social_share_code = function share(type, v) {
			var settings = $lcnb_wrap_obj.data('lcnb_settings');
			
			// normalize code and remove author
			var $fc = $('<div />').append(v.txt);
			$fc.find('.lcnb_author, iframe').remove();
			$fc.find('*').not('a, iframe').each(function() {
				var content = $(this).contents();
				$(this).replaceWith(content);
			});	
			var s_txt_orig = $fc.html();
			
			var s_title 	= encodeURIComponent(v.title).replace(/'/g,"\\'"),
				s_txt 		= encodeURIComponent( s_txt_orig.substring(0,1000) ).replace(/'/g,"\\'"),
				s_link 		= (typeof(v.s_link) == udf || v.s_link == '') ? encodeURIComponent(location.href) : encodeURIComponent(v.s_link),
				s_img 		= (typeof(v.img) == udf || v.img == '') ? '' : encodeURIComponent(v.img);
				s_fb_image 	= (!s_img) ? '' : '&picture='+ settings.fb_share_fix +'?u='+ s_img.replace(/'/g,"\\'");
			
			var code = 
			'<div class="lcnb_social_trigger noSwipe" title="share"><ul class="lcnb_social_box">';
			
				// facebook
				code += '<li class="lcnb_share_fb" title="share on Facebook" onClick="window.open(\'https://www.facebook.com/sharer/sharer.php?u='+ s_link +'&display=popup\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');"></li>';
	
				// twitter
				if(type == 'twitter') { // retweet code
					code += '<li class="lcnb_share_tw lcnb_retweet" title="share on Twitter" onClick="window.open(\'https://twitter.com/intent/retweet?tweet_id='+ v.tweet_id +'&amp;via='+ v.user_id +'\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');" ontouchstart="window.open(\'https://twitter.com/intent/retweet?tweet_id='+ v.tweet_id +'&amp;via='+ v.user_id +'\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');"></li>';
				} 
				else {
					code += '<li class="lcnb_share_tw" title="share on Twitter" onClick="window.open(\'https://twitter.com/share?text='+ html_to_tweet(s_txt_orig) +'&amp;url='+ s_link +'\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');" ontouchstart="window.open(\'https://twitter.com/share?text='+ html_to_tweet(s_txt_orig) +'&amp;url='+ s_link +'\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');"></li>';
				}
				
				// pinterest
				code += '<li class="lcnb_share_pt" onClick="window.open(\'http://pinterest.com/pin/create/button/?url='+ s_link +'&media='+ s_img +'&description='+ s_title +'\',\'sharer\',\'toolbar=0,status=0,width=575,height=330\');" href="javascript: void(0)"></li>';
				
				// google plus
				if(typeof(v.s_link) != udf && v.s_link != '') {
					code += '<li class="lcnb_share_gg" title="share on Google+" onClick="window.open(\'https://plus.google.com/share?url='+ s_link +'\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');" ontouchstart="window.open(\'https://plus.google.com/share?url='+ s_link +'\',\'sharer\',\'toolbar=0,status=0,width=548,height=325\');"></li>';
				} else {
					code += '<li></li>';	
				}

			return code + '</ul></div>';
		};
		

		
		/* toggle socials */ 
		$.fn.lcnb_toggle_socials = function(hide_all) {
			return this.each(function() {
				var $sb = $(this),
					$nb = $(this).parents('.lcnb_news'),
					$flap = $(this).find('.lcnb_social_box');				

				// hide every flap?
				if(typeof(hide_all) != udf) {
					$flap.parent('.lcnb_social_trigger').removeClass('socials_shown');
					return true;
				}

				// otherwise toggle
				$flap.parent('.lcnb_social_trigger').toggleClass('socials_shown');
			});
		};
		
		
		/* toggle socials on click */
		$('.lcnb_social_trigger').unbind('click');
		$lcnb_wrap_obj.delegate('.lcnb_social_trigger', vars.event_type, function() {
			var $subj = $(this);
			if(typeof(lcnb_one_click) != udf) {clearTimeout(lcnb_one_click);}
			
			lcnb_one_click = setTimeout(function() {
				stop_slideshow($subj);
				$subj.lcnb_toggle_socials();
				
				// close all other ones
				$subj.parents('.lcnb_wrap').find('.lcnb_social_trigger').not($subj).lcnb_toggle_socials(true);
			}, 20);
		});
	

		/* expanded news in lightbox - toggle socials */
		$(document).undelegate('.lcnb_mfp .lcnb_social_trigger', vars.event_type);
		$(document).delegate('.lcnb_mfp .lcnb_social_trigger', vars.event_type, function() {

			var $subj = $(this);
			if(typeof(lcnb_one_click) != udf) {clearTimeout(lcnb_one_click);}
			
			lcnb_one_click = setTimeout(function() {
				$subj.lcnb_toggle_socials();
			}, 20);
		});

	
		
		/* simulate link clicking linked overlay */
		$(document).undelegate('.lcnb_linked_img', vars.event_type);
		$(document).delegate('.lcnb_linked_img', vars.event_type, function() {

			var $parent = $(this).parent();
			window.open( $parent.data('link') , $parent.data('link-target'));
		});
	
		
	
		/* compose contents for expanded mode */
		var exp_news_contents = function($nb_obj, $news_obj, news_data) {
			var vars 		= $nb_obj.data('lcnb_vars'),
				settings 	= $nb_obj.data('lcnb_settings'),
				exp_img_pos = (typeof(news_data.exp_img_pos) != udf && news_data.exp_img_pos) ? news_data.exp_img_pos : settings.exp_main_img_pos; // exp img management - position
			
			// set expanded class
			$nb_obj.find('.lcnb_news').removeClass('expanded');
			$news_obj.addClass('expanded');

			// image block
			var has_img = (news_data.img) ? true : false;

			// force side img hiding
			if(exp_img_pos == 'hidden' || exp_img_pos == 'inside') { 
				has_img = false;
			}

			var lb_action 		= (has_img && typeof($news_obj.find('.lcnb_img').attr('data-mfp-src')) != udf) ? 'data-mfp-src="'+ $news_obj.find('.lcnb_img').attr('data-mfp-src') +'"' : '',
				img 			= (has_img) ? '<div class="lcnb_img lcnb_exp_main_img" '+ lb_action +'>'+ $news_obj.find('.lcnb_img').html().replace('lcnb_expand_trig', '') +'</div>' : '',
				fulltxt_class 	= (!has_img) ? 'lcnb_only_text' : ''; // fulltext class if image does not exists
			
			// clean image block
			if(has_img && img) {
				var $img_code = $(img);

				// remove no-lightbox elements 
				if($news_obj.find('.lcnb_img').hasClass('lcnb_no_lightbox')) { 
					$img_code.find('.lcnb_img_lb, .lcnb_video_lb').remove();
				} 
				img = $img_code.clone().wrap('<div>').parent().html();
			}

			// data block
			var socials = (settings.social_share) ? social_share_code(news_data.type, news_data) : ''; 

			var date = (!settings.read_more_btn && $.inArray('date', settings.hide_elements) === -1) ? 
				'<div class="lcnb_exp_date"><div class="lcnb_btn_time"><time class="lcnb_date">'+ date_format(news_data.date) +'</time></div></div>' : '';
			
			if(typeof(news_data.link) != udf && news_data.link != '') {
				 var trueLink = (news_data.type == 'soundcloud') ? news_data.s_link : news_data.link;
				 var link = '<div class="lcnb_link"><a href="'+ trueLink +'" target="_blank"></a></div>';
			} 
			else {var link = '';}
			
			var data_block = '<div class="lcnb_exp_data">' + date + socials + link + '</div>';
			
			// text box
			var title 	= (news_data.title) ? $news_obj.find('.lcnb_title').clone().removeAttr('style').wrap('<div>').parent().html() : '',
				txt 	= news_data.txt.replace(/fake-src="/g, 'src="');
			
			// if main image to put inside - prepend
			if(exp_img_pos == 'inside' && news_data.img) {
				txt = '<p><img src="'+ news_data.img +'" class="lcnb_exp_main_img" /></p>' + txt;	
			}

			// advanced images management for expanded layout
			if(settings.manage_exp_images) {
				txt = txt_img_management(txt, settings, $news_obj, news_data);
			}

			var code =
			'<div class="lcnb_exp_block noSwipe '+ fulltxt_class +'" data-news-id="'+ $news_obj.attr('rel') +'">' + 
				'<span class="lcnb_close"></span>'+ img +'<div class="lcnb_exp_txt">'+ title + txt +'</div>'+
				'<div class="lcnb_exp_clearboth"></div>'+
				data_block +
			'</div>';
			return code;			
		};
	
	
	
		/* expand news */
		var expand_news = function($wrapper, $news, nav_trigger) {
			var $nb_obj 	= $wrapper.parents('.lcnb_wrap').parent(),
				vars 		= $nb_obj.data('lcnb_vars'),
				settings 	= $nb_obj.data('lcnb_settings');
			
			// preventive check
			if(vars.is_expanded && typeof(nav_trigger) == udf) {
				return false;	
			}
			
			vars.is_expanded = true;	
			var news		= vars.sorted_news[ ($news.attr('rel') - 1)  ],
				exp_code 	= exp_news_contents($nb_obj, $news, news);
				

			// in lightbox?
			if(settings.exp_in_lightbox) {
				expand_thru_lb($nb_obj, $news, exp_code); 
				return false;	
			}


			$nb_obj.find('.lcnb_wrap, .lcnb_inner_wrapper').addClass('lcnb_expanded_mode');

			// if is changing displayed news
			if(typeof(nav_trigger) != udf) { 
				$wrapper.find('.lcnb_exp_block').last().css('z-index', 150).fadeTo(300, 0);

				setTimeout(function() {
					$wrapper.find('.lcnb_exp_block').last().remove();
				}, 300);
			}


			// append expanded block
			$wrapper.css('position', 'relative').prepend(exp_code);
			
			// expanded initial height
			if(settings.boxed_news) {
				var $obj = $wrapper.find('.lcnb_exp_block').first();
				
				var bn_margin = get_int($obj.css('margin-top')) + get_int($obj.css('margin-bottom'));
				var exp_h = settings.height - bn_margin;
			} else {
				var exp_h = settings.height;
			}
			$wrapper.find('.lcnb_exp_block').first().css('min-height', exp_h);
			
			// if has images, trigger preloader
			$wrapper.find('.lcnb_exp_block').lcnb_preload_img();

			// hide news
			if(typeof(nav_trigger) == udf) {
				$wrapper.find('.lcnb_news_overflow').clearQueue().animate({
					'opacity'	: 0,
					'top'		: '80%'	
				}, 500);
			}
			
			// show expanded block
			setTimeout(function() {
				// change the link target
				if(typeof(news.link_target) != udf && news.link_target) {
					$wrapper.find('.lcnb_exp_block a').attr('target', news.link_target);
				}
				
				$wrapper.find('.lcnb_exp_block').clearQueue().animate({
					'opacity'	: 1, 
					'top'		: 0
				}, 400);
				
				setTimeout(function() {
					man_expanded_layout( $wrapper.parents('.lcnb_wrap') );
				}, 200);
			}, 100);
			
			// show the text
			setTimeout(function() {
				$wrapper.find('.lcnb_exp_txt').fadeIn(200);
			}, 400);
		};
		
		
		
		/* show expanded contents through lightbox */
		var expand_thru_lb = function($nb_obj, $news_obj, contents) {
			var vars 		= $nb_obj.data('lcnb_vars'),
				settings 	= $nb_obj.data('lcnb_settings'),
				curr_news_id		= $news_obj.attr('rel');
			
			if(typeof($.fn.magnificPopup) != 'function')	{
				console.error('Magnific Popup not found');
				return false;	
			}
			
			// prepare contents
			var items = [];
			$.each(vars.sorted_news, function(i, v) {
				
				if(i == (curr_news_id - 1)) {
					var code = contents;	
				} 
				else {
					var $other_news_obj = $nb_obj.find('.lcnb_news[rel='+ (i+1) +']');
						code = exp_news_contents($nb_obj,  $other_news_obj, v); 	
						
						console.log(code);
				}
				
				items.push( {src : code} );	
			});
			
			
			// launch
			$.magnificPopup.open({
				type	: 'inline',
				items	: items,
				gallery: {
					enabled: true 
				},
				closeBtnInside: false,
				removalDelay: 300,
				mainClass	: 'lcnb_mfp lcnb_exp_in_lb lcnb_'+ settings.theme +'_theme',
			
				callbacks: {
					
					// preload images on content change
					change: function() {
						setTimeout(function() { // little delay to let contents to b added to DOM
							$('.lcnb_exp_in_lb .lcnb_exp_block').lcnb_preload_img();
						}, 50);
					},
					
					// manage flag on lb closing
					close: function() {
						vars.is_expanded = false;
						
						// if autoplay was acting - resume
						if(settings.autoplay && settings.autop_after_exp) {
							lcnb_start_slideshow($nb_obj.find('.lcnb_news').first(), true);	
						}
					},
       		 	}

			}, (curr_news_id - 1));
			$('.lcnb_exp_in_lb').attr('data-lcnb-instance', vars.box_id);
		};
		
		
		/* expand - event handler */
		$lcnb_wrap_obj.delegate('.lcnb_btn_expand, .lcnb_expand_trig', vars.event_type, function() {
			var vars 		= $(this).parents('.lcnb_wrap').parent().data('lcnb_vars'),
				$news 		= $(this).parents('.lcnb_news'),
				$wrapper 	= $(this).parents('.lcnb_inner_wrapper');
			
			vars.paused_on_h = false;
			stop_slideshow( $(this) );
			
			// close any social box
			$wrapper.find('.socials_shown').lcnb_toggle_socials(true);
			
			// expand
			expand_news($wrapper, $news);
			
			// check and adjust window offset to show beginning of expanded box
			var offset = $wrapper.offset();
			if($(window).scrollTop() > (offset.top - 20)) {
				$('html, body').animate({'scrollTop' : (offset.top - 10)}, 600, 'linear');	
			}
		});
		
		
		
		/* advanced images management in news texts */
		var txt_img_management = function(txt, settings, $news, news_obj) {
			var $fake = $('<div class="outer_wrap">'+ txt +'</div>');
			
			$fake.find('img').each(function(i, v) {
				
				// unwrap it!
				while( $(this).parent().not('.outer_wrap').length ) {
					$(this).unwrap();	
				}
				
				var $img 		= $(this),
					lb_url 		= (settings.lightbox) ? get_url_param($img.attr('src'), 'src') : '',
					lb_attr 	= (lb_url) ? 'data-mfp-src="'+ lb_url +'"' : '',
					lb_class	= (lb_attr) ? 'lcnb_img_lb' : '';

				// main image linked to a video?
				if( $(this).hasClass('lcnb_exp_main_img') && settings.lightbox && $news.find('.lcnb_video_lb').length ) {
					
					lb_url = $news.find('.lcnb_img').data('mfp-src');
					lb_attr  = 'data-mfp-src="'+ lb_url +'"';
					lb_class = 'lcnb_video_lb';	
				}
					
				var lb_code 		= (lb_attr) ? '<div class="lcnb_img_ol '+ lb_class +'"></div>' : '',
					on_row_class 	= (settings.exp_img_on_row) ? 'lcnb_exp_img_on_row' : '';
				
				var code = 
				'<div class="lcnb_img lcnb_loading_img" '+ lb_attr +'>'+
					lb_code +
					'<figure style="background-image: url(\''+ $(this).attr('src') +'\');"></figure>'+
					'<img src="'+ $(this).attr('src') +'" />'+
				'</div>';
				
				$(this).replaceWith('<div class="lcnb_exp_body_img '+ on_row_class +'">' + code + '</div>');	
			});
			
			
			// clean empty elements in description
			$fake.find('*:empty').not('br, img, i, iframe, .lcnb_exp_body_img *').remove();
			$fake.find('.lcnb_exp_body_img img').addClass('lcnb_exp_man_img');
			
			
			// exp sizes for the news
			var exp_img_w = (news_obj.exp_img_w) ? news_obj.exp_img_w : settings.exp_img_w;
			var exp_img_h = (news_obj.exp_img_h) ? news_obj.exp_img_h : settings.exp_img_h;

			if(exp_img_h != 225) {
				$fake.find('.lcnb_exp_body_img .lcnb_img').css('height', exp_img_h);	
			}
			if(exp_img_h == 'auto') {
				$fake.find('.lcnb_exp_body_img .lcnb_img').addClass('lcnb_exp_body_img_auto_h');
			}

			// sizing class
			$fake.find('.lcnb_exp_body_img').addClass('lcnb_exp_img_'+exp_img_w);
			
			return $fake.html(); 		
		};
		
		
		
		/* manage expanded layout and swiftbox height */
		var man_expanded_layout = function($subj) {
			var settings = $subj.parent().data('lcnb_settings'),	
				treshold = ($subj.find('.lcnb_exp_txt:first .lcnb_exp_body_img') > 1) ? 450 : 350;
			
			// responsive class
			if( $subj.find('.lcnb_exp_txt').width() < treshold) {
				$subj.find('.lcnb_exp_block').addClass('lcnb_exp_mobile');	
				var is_mobile = true;
			} 
			else {
				$subj.find('.lcnb_exp_block').removeClass('lcnb_exp_mobile');	
				var is_mobile = false;
			}
			
					
			// wait 300ms for CSS animations
			setTimeout(function() {
				// expanded box height
				var exp_h = $subj.find('.lcnb_exp_txt').outerHeight(true) + 
							$subj.find('.lcnb_exp_clearboth').outerHeight(true) + 
							($subj.find('.lcnb_exp_block ').outerHeight(false) - $subj.find('.lcnb_exp_block').height());	

				// if image exists
				if(is_mobile && typeof($img_wrap) != udf && $img_wrap.length) {
					exp_h = exp_h + $img_wrap.find('img').outerHeight(true);
				}
				
				// boxed news margin to show shadows
				var nb_margin = (settings.boxed_news) ? get_int($subj.css('margin-top')) + get_int($subj.css('margin-bottom')) : 0;
				
				// animate swiftbox wrapper height	
				if((exp_h + nb_margin) > settings.height) {	
					if( $subj.height() != (exp_h + nb_margin) ) {
					
						// check to trigger smooth trick
						if((exp_h + nb_margin) - settings.height > 70) {
							var smooth_timing = Math.round( (((exp_h + nb_margin) - 400) / 30) * 17);
							$subj.clearQueue().animate({'height': exp_h + nb_margin}, (400 + smooth_timing));
						}
						else {
							$subj.clearQueue().animate({'height': exp_h + nb_margin}, 400);
						}
					}
				} 
				else {
					if( $subj.height() != settings.height ) {
						$subj.clearQueue().animate({'height': settings.height}, 400);
					}
				}
			}, 300);
		};
		
		
		
		/* close expanded news */
		var close_expanded = function($wrapper) {
			var $nb_obj 	= $wrapper.parents('.lcnb_wrap').parent(), 
				settings 	= $nb_obj.data('lcnb_settings'),
				vars 		= $nb_obj.data('lcnb_vars');
				
			vars.is_expanded = false;
			
			//// return to the original swiftbox height
			var exp_h = $wrapper.find('.lcnb_exp_block').height();
			
			// check for smoother trick
			var timing = (exp_h - settings.height > 70) ? 500 + Math.round( (exp_h / 30) * 18) : 500;
			
			$wrapper.parents('.lcnb_wrap').clearQueue().animate({'height': settings.height}, 500);
			
			// if was scrolling expanded news, return to boxes
			if(settings.scroll_exp_elem){
				var offset = $wrapper.offset();
				if($(window).scrollTop() > (offset.top + settings.height - 20)) {
					$('html, body').animate({'scrollTop' : (offset.top - 10)}, 600, 'linear');	
				}
			}
			
			// hide the block
			$wrapper.find('.lcnb_exp_block').clearQueue().animate({ 'top': '-' + (exp_h + 100)  }, timing);
			$wrapper.find('.lcnb_exp_block').clearQueue().animate({'opacity': 0}, 500);
			
			// show news
			setTimeout(function() {
				$wrapper.find('.lcnb_news_overflow').clearQueue().animate({
					'opacity' 	: 1,
					'top'		: 0,
				}, 400);
			}, 100);
			
			// clean
			setTimeout(function() {
				$nb_obj.find('.lcnb_wrap, .lcnb_inner_wrapper').removeClass('lcnb_expanded_mode');
				$wrapper.find('.lcnb_news').removeClass('expanded');
				$wrapper.find('.lcnb_exp_block').remove();
				$wrapper.css('height', 'inherit');

				// if autoplay was acting - resume
				if(settings.autoplay && settings.autop_after_exp) {
					lcnb_start_slideshow($wrapper.find('.lcnb_news').first(), true);	
				}
			}, 550);
		}
		$lcnb_wrap_obj.delegate('.lcnb_exp_block .lcnb_close', vars.event_type, function() {
			var $wrapper = $(this).parents('.lcnb_inner_wrapper');
			close_expanded($wrapper);
		});
		
		
		
		////////////////////////////////////////////////////////////
		
		

		//// lightbox integration
		// image
		$lcnb_wrap_obj.delegate('.lcnb_img_lb:not(.lcnb_expand_trig, .lcnb_linked_img)', 'click ontouchstart', function() {
			var settings = $(this).parents('.lcnb_wrap').parent().data('lcnb_settings'),
				vars = $(this).parents('.lcnb_wrap').parent().data('lcnb_vars');
			
			vars.paused_on_h = false;
			stop_slideshow( $(this));
			
			var curr_src 		= $(this).parents('.lcnb_img').attr('data-mfp-src'),
				$img_subj_src 	= ( $(this).parents('.lcnb_exp_block').length ) ? $(this).parents('.lcnb_exp_block').find('.lcnb_img') : $(this).parents('.lcnb_img'), // gallery on exp mode
				$zoom_subj 		= $(this).parents('.lcnb_img');
			
			// find the index in case of gallery
			var index 	= 0,
				gallery = [];
			
			$img_subj_src.each(function(i, v) {
				if( $(this).attr('data-mfp-src') == curr_src ) {
					index = i;
				}
				
				gallery.push( {src : $(this).attr('data-mfp-src')} );
			});
			
			$.magnificPopup.open({
				items		: gallery,
				gallery: {
					enabled: true
				},
				type		: 'image',
				mainClass	: 'lcnb_mfp mfp-with-zoom lcnb_'+ settings.theme +'_theme',
				closeOnContentClick: true,
				closeBtnInside: false,
				image		: {
					verticalFit: true
				},
				removalDelay: 300
			}, index);	
		});
		
		// video
		$lcnb_wrap_obj.delegate('.lcnb_video_lb:not(.lcnb_expand_trig, .lcnb_linked_img)', 'click ontouchstart', function() {
			stop_slideshow( $(this));
			
			var settings = $(this).parents('.lcnb_wrap').parent().data('lcnb_settings'),
				src = $(this).parents('.lcnb_img').attr('data-mfp-src');

			$.magnificPopup.open({
			  items: {
				src: src
			  },
			  type: 'iframe',
			  mainClass	: 'lcnb_mfp lcnb_'+ settings.theme +'_theme',
			  closeBtnInside: false,
			  removalDelay: 300,
			  iframe: {
				patterns: {
					youtube: {
					  src: '//www.youtube.com/embed/%id%?autoplay=1&rel=0'
					}
				}
			  }
			}, 0);
		});
		
		
		
		/* touchswipe integration */
		var lcnb_touchswipe = function(changing_layout) {
			if(typeof($.fn.swipe) != 'function') {return false;}

			if(typeof(changing_layout) != udf) {
				$lcnb_wrap_obj.find('.lcnb_touchswipe .lcnb_inner_wrapper').swipe("destroy");
			}
			
			
			$lcnb_wrap_obj.find('.lcnb_touchswipe .lcnb_inner_wrapper').swipe({
				
				swipeStatus: function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection) {
					var $wrap 		= $(this),
						$nb_bj 		= $wrap.parents('.lcnb_wrap').parent(),
						$inner 		= $wrap.find('.lcnb_inner'),
						settings	= $nb_bj.data('lcnb_settings'),
						vars		= $nb_bj.data('lcnb_vars'),
						news_size	= get_news_size($nb_bj);
					
					if(distance > 10 && !vars.is_moving) {
						
						if($nb_bj.find('.lcnb_wrap').hasClass('lcnb_horizontal')) {
							if( typeof( $wrap.attr('data-swipe-base')) == udf) {
								
								var init_margin = get_int( $inner.css('margin-left'));
								$wrap.attr('data-swipe-base', init_margin);	
							} 
							else {
								var init_margin = $wrap.attr('data-swipe-base');
							}
							
							var new_margin = (direction == 'right') ? (Math.abs(init_margin) * -1) + distance : init_margin - distance;
							if(new_margin > 0) {new_margin = 0;}
							
							// check for margin going over last elem on NON carousel
							if(!settings.carousel && Math.abs(new_margin) > ($inner.width() - (vars.news_to_show * news_size))) {
								new_margin = ($inner.width() - (vars.news_to_show * news_size)) * -1;
							}
							
							$inner.css('margin-left', new_margin);
	
							
							// on swipe end know how many to scroll
							if(phase == "end") {
								var to_slide = Math.ceil( Math.abs(distance) / vars.news_w);
								
								var slide_dir = (direction == 'right') ? 'prev' : 'next';
								lcnb_news_slide($lcnb_wrap_obj, slide_dir, to_slide, true);
									
								$wrap.removeAttr('data-swipe-base');
							}
						}
						
						// vertical layout
						else {
							if( typeof( $wrap.attr('data-swipe-base')) == udf) {
								
								var init_margin = get_int( $inner.css('margin-top'));
								$wrap.attr('data-swipe-base', init_margin);	
							} 
							else {
								var init_margin = $wrap.attr('data-swipe-base');
							}
							
							var new_margin = (direction == 'down') ? (Math.abs(init_margin) * -1) + distance : init_margin - distance;
							if(new_margin > 0) {new_margin = 0;}
							
							// check for margin going over last elem on NON carousel
							if(!settings.carousel && Math.abs(new_margin) > ($inner.height() - (vars.news_to_show * news_size))) {
								new_margin = ($inner.height() - (vars.news_to_show * news_size)) * -1;
							}
	
							$inner.css('margin-top', new_margin);
	
							
							// on swipe end know how many to scroll
							if(phase == "end") {
								var to_slide = Math.ceil( Math.abs(distance) / vars.news_h);
								
								var slide_dir = (direction == 'down') ? 'prev' : 'next';
								lcnb_news_slide($lcnb_wrap_obj, slide_dir, to_slide, true);
									
								$wrap.removeAttr('data-swipe-base');
							}
						}	
					}
				},
				threshold: 10
			});
		};
		
		
		
		/* parseInt function in matrix 10 - to save space */
		var get_int = function(val) {
			return parseInt(val, 10);
		};

		
		
		/* given an url - get a specific parameter or return original url */
		var get_url_param = function(url, param) {
			var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(url);
			if (results == null){
			   return url;
			} else{
			   return decodeURIComponent(results[1]) || 0;
			}
		};
		
		  
		
		/* check if is mobile browser */
		var is_mobile = function() {
			if( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent) ) 
			{ return true;}
			else { return false; }
		};



		////////////////////////////////////////////
		


		/* next news - click event */
		$('.lcnb_next').unbind('click');
		$lcnb_wrap_obj.delegate('.lcnb_next:not(.lcnb_disabled)', 'click', function() {
			var $subj = $(this);
			if(typeof(lcnb_one_click) != udf) {clearTimeout(lcnb_one_click);}
			
			var vars 		= $lcnb_wrap_obj.data('lcnb_vars'),
				settings	= $lcnb_wrap_obj.data('lcnb_settings');
				to_slide = (settings.slide_all && settings.slideshow_time > 0 && !vars.is_expanded) ? vars.news_to_show : 1;
			
			lcnb_one_click = setTimeout(function() {
				stop_slideshow($subj);
				lcnb_news_slide($lcnb_wrap_obj, 'next', to_slide);	
			}, 5);
		});


		/* prev news - click event */
		$('.lcnb_prev').unbind('click');
		$lcnb_wrap_obj.delegate('.lcnb_prev:not(.lcnb_disabled)', 'click', function() {
			var $subj = $(this);
			if(typeof(lcnb_one_click) != udf) {clearTimeout(lcnb_one_click);}
			
			var vars 		= $lcnb_wrap_obj.data('lcnb_vars'),
				settings	= $lcnb_wrap_obj.data('lcnb_settings');
				to_slide = (settings.slide_all && settings.slideshow_time > 0 && !vars.is_expanded) ? vars.news_to_show : 1;
			
			lcnb_one_click = setTimeout(function() {
				stop_slideshow($subj);
				lcnb_news_slide($lcnb_wrap_obj, 'prev', to_slide);	
			}, 5);
		});
		
		
		
		////////////////////////////////////////////
		
	
		
		/* responsive behaviors */
		$(window).resize(function() {
			var vars 		= $lcnb_wrap_obj.data('lcnb_vars'),
				settings	= $lcnb_wrap_obj.data('lcnb_settings');	
			
			if(vars.box_curr_w == Math.round($lcnb_wrap_obj.width())) {
				return false;	
			}
			vars.box_curr_w = Math.round($lcnb_wrap_obj.width());	
			
			
			if(typeof(lcnb_resize_tout[ vars.box_id ]) != udf) {
				  clearTimeout(lcnb_resize_tout[ vars.box_id ]);  
			}
			
			lcnb_resize_tout[ vars.box_id ] = setTimeout(function() {	
				dynamic_layout();
				size_boxes();
				
				if(!settings.carousel) {
					set_scroll_margin_after_resize($lcnb_wrap_obj);
				}
				
				// if is expanded
				if(vars.is_expanded) {
					man_expanded_layout( $lcnb_wrap_obj.find('.lcnb_wrap') );
				}
			}, 100);
		});

		
		
		/* expanded news - scroll events */
		$(window).scroll(function() {
	
			if(typeof(lcnb_exp_scroll_tout[ vars.box_id ]) != udf) {
				  clearTimeout(lcnb_exp_scroll_tout[ vars.box_id ]);  
			}
			
			lcnb_exp_scroll_tout[ vars.box_id ] = setTimeout(function() {
				var settings = $lcnb_wrap_obj.data('lcnb_settings');	
			
				if($lcnb_wrap_obj.find('.lcnb_exp_block').length && settings.scroll_exp_elem) {

					var $subj  = $lcnb_wrap_obj.find('.lcnb_exp_block').first(),
						offset = $subj.offset();
					
					if($subj.height() > settings.height + 30 && $(window).scrollTop() > (offset.top + 30)) {
						
						// for the closing button
						if($(window).scrollTop() < (offset.top + ($subj.height() - 35)) ) {
							var margin_top = Math.floor( $(window).scrollTop() - offset.top - 7); 
							$subj.find('.lcnb_close').css('margin-top', margin_top);
						} 
						
						// for the image
						if( $(window).scrollTop() < (offset.top + ($subj.height() - ($subj.find('> .lcnb_exp_main_img').height() - 25) )) ) {
							if($subj.hasClass('lcnb_exp_mobile')) {
								$subj.find('> .lcnb_exp_main_img').css('margin-top', 0);
							}
							else {
								var margin_top = Math.floor( $(window).scrollTop() - offset.top); 
								$subj.find('> .lcnb_exp_main_img').css('margin-top', margin_top);
							}
						}
					} 
					else {
						$subj.find('.lcnb_close, > .lcnb_exp_main_img').css('margin-top', 0);
					}
				}
			}, 60);
		}); 
		


		//////////////////////////////////////////
		
		
		
		/* script and styles loader */
		var assets_loader = function() {
			
			// retrieve basepath
			if( typeof(lcnb_script_basepath) == udf ) {
				if(settings.script_basepath) { 
					lcnb_script_basepath = settings.script_basepath;
				} 
				else {
					$('script').each(function(index, element) {
                        var src = $(this).attr('src');
						if( typeof(src) != udf && src.indexOf('swift-box') != -1 ) {
							var src_arr = src.split('/');
							var lastEl = src_arr[src_arr.length - 1];	
							lcnb_script_basepath = src.replace(lastEl, '');
						}
						else {
							lcnb_script_basepath = '';
							return false; // no basepath found - you have to enqueue elements manually	
						}
                    });	
				}
			}
			
			// have been already manually added?
			if(settings.scripts_man_added) {
				return true;	
			}
			
			// load theme
			if( typeof(lcnb_loaded_themes) == udf ) {lcnb_loaded_themes = [];}
			if( $.inArray(settings.theme, lcnb_loaded_themes) === -1 ) {
				lcnb_loaded_themes.push(settings.theme);
				$('head').append('<link rel="stylesheet" href="'+ lcnb_script_basepath +'themes/'+ settings.theme +'.css">');	
			}
			
			//// load scripts
			if( typeof(lcnb_loaded_scripts) == udf ) {lcnb_loaded_scripts = [];}
			
			// magnific popup
			if(settings.lightbox && $.inArray('magnific_popup', lcnb_loaded_scripts) === -1 && typeof($.fn.magnificPopup) != 'function') {
				lcnb_loaded_scripts.push('magnific_popup');
				$('head').append('<link rel="stylesheet" href="'+ lcnb_script_basepath +'js_assets/magnific-popup/magnific-popup-style.css">');
				$('body').append('<script src="'+ lcnb_script_basepath +'js_assets/magnific-popup/magnific-popup.min.js" type="text/javascript"></script>');	
			}
			
			// touchswipe
			if(settings.touchswipe && $.inArray('touchswipe', lcnb_loaded_scripts) === -1 && typeof(swipe) != 'function') {
				lcnb_loaded_scripts.push('touchswipe');
				$('body').append('<script src="'+ lcnb_script_basepath +'js_assets/TouchSwipe/jquery.touchSwipe.min.js" type="text/javascript"></script>');	
			}
			
			return true;
		};
		
		
		
		///////////////////////////////////////////////////////
		///////////////////////////////////////////////////////
		
		
		// set box ID
		$lcnb_wrap_obj.attr('data-lcnb-id', vars.box_id);

		// load styles and scripts
		var result = assets_loader();
		
		//// Initialize the news box - create the html structure
		parse_inline_news();
		
		
		//// CLASSES
		var classes = [];
		
		// preloader?
		if(settings.preloader) {
			classes.push('lcnb_loading');	
		}
		
		// theme class
		classes.push('lcnb_'+ settings.theme +'_theme');
		
		// nav_arrows class
		if(settings.nav_arrows) {
			classes.push('lcnb_has_cmd lcnb_'+ settings.nav_arrows +'_cmd');
			
			if(settings.nav_arrows.match(/top/g)) 		{classes.push('lcnb_top_cmd');}
			if(settings.nav_arrows.match(/bottom/g)) 	{classes.push('lcnb_bottom_cmd');}
		}

		// boxed news class
		var boxed_class = (!settings.boxed_news) ? 'lcnb_uniblock' : 'lcnb_boxed';
		classes.push(boxed_class);
		
		
		// touchswipe class
		if(settings.touchswipe) {
			classes.push('lcnb_touchswipe');
		}
		
		// create unique numeric ID linked to instance
		lcnb_count = (typeof(lcnb_count) == udf) ? 1 : lcnb_count + 1;
		
		///////////////////////////////
		// structure init
		var structure = '<div id="lcnb_'+ lcnb_count +'" class="lcnb_wrap lcnb_'+ settings.layout +' '+ classes.join(' ') +'">';
		
		// command box
		if(settings.nav_arrows) {
			var disabled_class = (!settings.carousel) ? 'lcnb_disabled' : '';
			structure += '<div class="lcnb_cmd"><div class="lcnb_prev '+ disabled_class +'"><span></span></div><div class="lcnb_next"><span></span></div></div>';	
		}
		
		// inner wrapper and inner 
		structure += 
		'<div class="lcnb_inner_wrapper">'+
			'<div class="lcnb_news_overflow">'+
				'<div class="lcnb_inner" style="height: '+ settings.height +'px;"></div>'+
			'</div>'+	
		'</div>';
		
		$lcnb_wrap_obj.html(structure + '</div>');
		
		
		
		////////////////////////////////////////
			
		
		
		// event type definition for mobile
		if(is_mobile()) {vars.event_type = 'tap';}



		///////////////////////////////



		/* execution */
		setTimeout(function() {
			dynamic_layout();
			handle_sources();
		}, 50);

		return this;
	};	
		
		
	
		
		
	///////////////////////////////////////////////////////
	//// PUBLIC METHODS ///////////////////////////////////
	///////////////////////////////////////////////////////
	
	
	/* init */
	$.fn.lc_swift_box = function(lcnb_settings) {


		/* destruct */
		$.fn.lcsb_destroy = function() {
			var $elem = $(this);
			
			// clear slideshow interval
			var vars = $elem.data('lcnb_vars');
			if(vars.is_playing) {clearInterval(vars.is_playing); }
			$elem.find('.lcnb_inner').stop(); // if was moving - clear animation
			
			// destroy touchswipe
			var settings = $elem.data('lcnb_settings');
			if(settings.touchswipe) {$elem.find('.lcnb_touchswipe .lcnb_inner_wrapper').swipe("destroy");}
			
			// undelegate events
			$elem.undelegate('.lcnb_inner_wrapper', 'mouseenter mouseleave');
			$elem.undelegate('.lcnb_social_trigger', vars.event_type);
			$elem.undelegate('.lcnb_btn_expand', vars.event_type);
			$elem.undelegate('.lcnb_exp_block .lcnb_close', vars.event_type);
			$elem.undelegate('.lcnb_img_lb, .lcnb_video_lb', 'click ontouchstart');
			$elem.find('.lcnb_next, .lcnb_prev').undelegate('click');
			
			// remove stored data
			$elem.removeData('lcnb_vars');
			$elem.removeData('lcnb_settings');
			$elem.removeData('lc_swiftbox');
			
			return true;
		};	
		
		
		
		/* pagination (next/prev) */
		$.fn.lcsb_paginate = function(direction) {
			var $elem = $(this);

			var vars 		= $elem.data('lcnb_vars'),	
				settings 	= $elem.data('lcnb_settings'),
				to_slide = (settings.slide_all && settings.slideshow_time > 0) ? vars.news_to_show : 1;
			
			if(typeof(vars.is_playing) != udf) {
				clearInterval(vars.is_playing);
			}
			vars.is_playing = null;

			lcnb_news_slide($elem, direction, to_slide);
			return true;
		};
		
		
		
		/* start slideshow */
		$.fn.lcsb_start_slideshow = function() {
			var $elem = $(this);
			
			var vars 		= $elem.data('lcnb_vars'),	
				settings 	= $elem.data('lcnb_settings');	

			// wait until animation stops
			vars.waiting_for_anim = setInterval(function() {
				
				if(typeof(vars.is_moving) == 'undefined' || !vars.is_moving) {
					var delay = (settings.slideshow_time > 1000) ? 1000 : settings.slideshow_time;
					
					setTimeout(function() {
						lcnb_start_slideshow($elem);
					}, delay);
					
					clearInterval(vars.waiting_for_anim);		
				}
			}, 5);

			return true;
		};
		
		
		
		/* stop the slideshow */
		$.fn.lcsb_stop_slideshow = function() {
			var $elem = $(this);

			var vars 		= $elem.data('lcnb_vars'),	
				settings 	= $elem.data('lcnb_settings');
			
			clearInterval(vars.is_playing);
			vars.is_playing = null;
			
			if(typeof(vars.waiting_for_anim) != 'undefined') {
				clearInterval(vars.waiting_for_anim);	
			}
			
			return true;
		};



		/* construct */
		return this.each(function(){
            // Return early if this element already has a plugin instance
            if ( $(this).data('lc_swiftbox') ) { return $(this).data('lc_swiftbox'); }
			
            // Pass options to plugin constructor
            var swift_box = new lc_SwiftBox(this, lcnb_settings);
			
            // Store plugin object in this element's data
            $(this).data('lc_swiftbox', swift_box);
        });
	};			
	
})(jQuery);
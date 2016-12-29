$(document).ready(function () {

	$('.image-slider').slick({
	  slidesToShow: 3,
	  slidesToScroll: 1,
	  autoplay: true,
	  autoplaySpeed: 2000,
	  arrows: false,
	  dots: true
	});

	$(document).snowfall({
		flakeCount: 500,
		flakeColor:	'#fff',
		maxSize: 5,
		maxSpeed: 5,
		round: true,
		shadow: true
	});

	populateCountries('map-country');
	$('#map-country').simpleselect();

	$(document).on('click', '.tabs-navigation li a', function (e) {

		e.preventDefault();
		var tab_id = $(this).parent().attr('data-tab');
		$('.active[data-tab]').removeClass('active');
		$('[data-tab="' + tab_id + '"]').addClass('active');

	});

	$(document).on('click', '.tabs-next', function (e) {
		e.preventDefault();
		var tab_id = $('.active[data-tab]').attr('data-tab');
		tab_id++;

		if ($('[data-tab=' + tab_id + ']').length === 0) {
			tab_id = $('[data-tab]:first-child').attr('data-tab');
		}

		$('.active[data-tab]').removeClass('active');
		$('[data-tab="' + tab_id + '"]').addClass('active');

	});

	$(document).on('click', '.tabs-prev', function (e) {
		e.preventDefault();
		var tab_id = $('.active[data-tab]').attr('data-tab');
		tab_id--;

		if ($('[data-tab=' + tab_id + ']').length === 0) {
			tab_id = $('[data-tab]:last-child').attr('data-tab');
		}

		$('.active[data-tab]').removeClass('active');
		$('[data-tab="' + tab_id + '"]').addClass('active');
	});

	$(document).on('click', '.map-title', function () {
		$('.location-form').slideToggle();
	});

	$(document).on('click', '.showMyLocation', function (e) {
		e.preventDefault();
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				coordinates = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				map.setCenter(coordinates);
				marker.setPosition(coordinates);
				infowindow.setContent('<h2> You are here</h2>');
				$('.location-form').slideUp();
			});
		}
	});

	$(document).on('submit', '.location-form form', function (e) {
		e.preventDefault();
		var country = $('#map-country').val();
		var city = $('#map-city').val();
		var address = $('#map-address').val();
		var zip = $('#map-zip').val();
		var validated = true;

		if (isEmpty(country) || country == '-1') {
			$('#map-country').closest('.map-form-field').addClass('error');
			validated = false;
		} else {
			$('#map-country').closest('.map-form-field').removeClass('error');
		}

		if (isEmpty(city)) {
			$('#map-city').closest('.map-form-field').addClass('error');
			validated = false;
		} else {
			$('#map-city').closest('.map-form-field').removeClass('error');
		}

		if (isEmpty(address)) {
			$('#map-address').closest('.map-form-field').addClass('error');
			validated = false;
		} else {
			$('#map-address').closest('.map-form-field').removeClass('error');
		}

		if (isEmpty(zip) || zip.length != 5) {
			$('#map-zip').closest('.map-form-field').addClass('error');
			validated = false;
		} else {
			$('#map-zip').closest('.map-form-field').removeClass('error');
		}

		if (validated) {

			saveAddressToCookies(zip, country, city, address);

			var request_address = getFormattedAddress(zip, country, city, address);
			var request_link = 'https://maps.google.com/maps/api/geocode/json?address=' + request_address;

			$.post(
				request_link, {},
				function (response) {
					if (typeof response.results != 'undefined' && response.status == 'OK') {
						coordinates = response.results[0].geometry.location;
						map.setZoom(18);
						map.setCenter(coordinates);
						marker.setPosition(coordinates);
						infowindow.setContent('<p>' + response.results[0].formatted_address + '</p>');
						$('.location-form').slideUp();
					} else {
						alert('Address not found!');
					}
				}
			);

		}

	});

	$(document).ready(function(){
  		$('#map-check').iCheck({
    		checkboxClass: 'icheckbox_flat-red',
    		radioClass: 'iradio_flat-red'
  		});
	});

	$(document).on('click', '[data-toggle="modal"]', function (e) {

		e.preventDefault();
		var el_selector = $(this).attr('data-target');
		$(el_selector).fadeIn();

	});

	$(document).on('click', '.modal .close-modal', function (e) {

		e.preventDefault();
		$(this).closest('.modal').fadeOut();

	});

	fixed_head_pos = $('.head-row-second').offset().top;
	fixed_head_height = $('.head-row-second').outerHeight();

});

var fixed_head_pos, fixed_head_height;

$(document).scroll(function () {

	var scroll_top = $(window).scrollTop();
	if (scroll_top >= fixed_head_pos) {
		$('.head-row-second').addClass('fixed');
		$('body').css('padding-top', fixed_head_height + 'px');
	} else {
		$('.head-row-second').removeClass('fixed');
		$('body').css('padding-top', '0');
	}

});

$(window).load(function () {

	$('.masonry-content').masonry({
		'itemSelector': '.masonry',
		'gutter': '.masonry-gutter',
		'columnWidth': '.masonry-sizer',
		'percentPosition': true
	});

	var tabs_max_height = 0;
	$('.tabs-content .tab-content').css('display', 'block');

	$('.tabs-content .tab-content').each(function () {
		var height = $(this).outerHeight(true);
		if (height > tabs_max_height) {
			tabs_max_height = height;
		}
	});

	$('.tabs-content').css('height', tabs_max_height + 'px');
	$('.tabs-content .tab-content').css('display', '');

	if ($('.location-form').lenght > 0 && $('.location-form').is('.form_results')) {

		var zip = getCookie('zipcode');
		var country = getCookie('country');
		var address = getCookie('city');
		var city = getCookie('address');

		if (typeof zip !== 'undefined') {
			$('#map-zip').val(zip);
		}
		if (typeof country !== 'undefined') {
			$('#map-country').val(country);
		}
		if (typeof city !== 'undefined') {
			$('#map-city').val(city);
		}
		if (typeof address !== 'undefined') {
			$('#map-address').val(address);
		}
	}




});

function isEmpty(str) {
	return (str.length === 0);
}

function getFormattedAddress(m_zip, m_country, m_city, m_address) {
	var formatted_address = m_address + ', ' + m_city + ', ' + m_zip + ', ' + m_country;
	return encodeURI(formatted_address);
}

function getCoordinates(m_zip, m_country, m_city, m_address) {
	var formatted_address = m_address + ', ' + m_city + ', ' + m_zip + ', ' + m_country;
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({
		'address': formatted_address
	}, function (result) {
		console.log(result[0].geometry.location);
	});
}

function saveAddressToCookies(m_zip, m_country, m_city, m_address) {

	var date = new Date(new Date().getTime() + 60 * 1000);

	document.cookie = "zipcode=" + m_zip + "path=/; expires=" + date.toUTCString();
	document.cookie = "country=" + m_country + "path=/; expires=" + date.toUTCString();
	document.cookie = "city=" + m_city + "path=/; expires=" + date.toUTCString();
	document.cookie = "address=" + m_address + "path=/; expires=" + date.toUTCString();
}

function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

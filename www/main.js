$(document).ready( function() {
   
    var container = $('#mustache-html');

    function getEventHTML(startDate, endDate, callback) {

        $.get( 'events.php?startdate=' + startDate.toISOString() + '&enddate=' + endDate.toISOString(), function( data ) {
            var groupedByDate = [];
            var mustacheData = { dates: [] };            
            $.each(data.events, function( index, value ) {

                var date = container.formatDate(value.date);
                if (groupedByDate[date] === undefined) {
                    groupedByDate[date] = {
                        yyyymmdd: value.date,
                        date: date,
                        events: []
                    };
                    mustacheData.dates.push(groupedByDate[date]);
                }
                var timeParts = value.time.split(':');
                var hour = parseInt(timeParts[0]);
                var meridian = 'AM';
                if ( hour === 0 ) {
                    hour = 12;
                } else if ( hour >= 12 ) {
                    meridian = 'PM';
                    if ( hour > 12 ) {
                        hour = hour - 12;
                    }
                }
                value.displayTime = hour + ':' + timeParts[1] + ' ' + meridian;
                value.mapLink = container.getMapLink(value.address);
                // value.showEditButton = true; // TODO: permissions
                groupedByDate[date].events.push(value);
            });


            for ( var date in groupedByDate )  {
                groupedByDate[date].events.sort(container.compareTimes);
            }
            var template = $('#view-events-template').html();
            var info = Mustache.render(template, mustacheData);
           	callback(info);
        });
    }

    function deleteEvent(id, secret) {
        var opts = {
            type: 'POST',
            url: 'delete_event.php',
            contentType: false,
            processData: false,
            cache: false,
            data: 'json=' + JSON.stringify({
                id: id,
                secret: secret
            }),
            success: function(returnVal) {
                var msg = 'Your event has been deleted';
                $('#success-message').text(msg);
                $('#success-modal').modal('show');
            },
            error: function(returnVal) {
                var err = returnVal.responseJSON
                    ? returnVal.responseJSON.error
                    : { message: 'Server error deleting event!' };
                $('#save-result').addClass('text-danger').text(err.message);
            }
        };
        $.ajax(opts);
    }

    function viewEvents(hash){
        var startDate = new Date(); 
        var endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 9);

        container.empty()
             .append($('#legend-template').html());

        getEventHTML(startDate, endDate, function (eventHTML) {
             container.append(eventHTML);

             var $selected = $(hash);
             if ($selected.length > 0) {
                 $selected[0].scrollIntoView(true);
                 $($selected[0]).click(); // simulate click to expand event
             } else {
                 location.hash = 'viewEvents';
             }
             container.append($('#load-more-template').html());
             $(document).off('click', '#load-more')
                  .on('click', '#load-more', function(e) {
                      startDate.setDate(startDate.getDate() + 10);
                      endDate.setDate(startDate.getDate() + 9);
                      getEventHTML(startDate, endDate, function(eventHTML) {
                          $('#load-more').before(eventHTML);
                      });
                      return false;
                 });
        });
    }
    
    function viewAbout() {
        var content = $('#aboutUs').html();
        container.empty().append(content);
    }
    
    function viewPedalpalooza() {
        location.hash = 'pedalpalooza';    
        var startDate = new Date("June 9, 2016");
        var endDate = new Date("July 4, 2016 23:59:59");
        var pedalpalooza = './images/pp2016.jpg';
        container.empty()
             .append($('#pedalpalooza-header').html())
             .append($('#legend-template').html());
        getEventHTML(startDate, endDate, function (eventHTML) {
             container.append(eventHTML);
             container.append($('#pedalpalooza-prior').html());         
        });
    }
    
    function dateJump(ev) {
        var e = ev.target;
        if (e.hasAttribute('data-date')) {
            var $e = $(e);
            var yyyymmdd = $e.attr('data-date');
            var $jumpTo = $("div[data-date='" + yyyymmdd + "']");
            if($jumpTo.children().length >= 0) {
            
                $('html, body').animate({
                    scrollTop: $jumpTo.offset().top
                }, 500);
            }
        }    
    }

    function viewAddEventForm(id, secret) {
        container.getAddEventForm( id, secret, function(eventHTML) {
            container.empty().append(eventHTML);
        });
    }
    
    $(document).on('click', 'a#add-event-button', viewAddEventForm);
    
    $(document).on('click', 'a#view-events-button, #confirm-cancel, #success-ok', viewEvents);

    $(document).on('click', 'a#about-button', function(e) {
        viewAbout();
    });

    $(document).on('click', 'a#oldSite-button', function(e) {
        window.location.href = "http://shift2bikes.com/cal";
    });
    
    $(document).on('click', 'a#pedalpalooza-button', function(e) {
        viewPedalpalooza();
    });


    $(document).on('click', '#date-picker-pedalpalooza', function(ev) {
        dateJump(ev);
    });
    
    $(document).on('click','.navbar-collapse.collapse.in',function(e) {
        if( $(e.target).is('a') ) {
            $(this).collapse('hide');
        }
    });

    $(document).on('click', 'a.expandDetails', function(e) {
        e.preventDefault();
        return false;
    });

    $(document).on('click', 'button.edit', function(e) {
        var id = $(e.target).closest('div.event').data('event-id');
        viewAddEventForm(id);
    });

    $(document).on('click', '#preview-edit-button', function() {
        $('#event-entry').show();
        $('.date').remove();
        $('#preview-button').show();
        $('#preview-edit-button').hide();
    });

    if (/^#pedalpalooza/.test(location.hash)) {
        viewPedalpalooza();
    } else if (/^#addEvent/.test(location.hash)) {
        viewAddEventForm();
    } else if (
        /^#editEvent/.test(location.hash) &&
        location.hash.indexOf('/') > 0
    ) {
        var locationHashParts = location.hash.split('/');
        viewAddEventForm(locationHashParts[1], locationHashParts[2]);
    } else {
        viewEvents(location.hash);
    }
    // Set up email error detection and correction
    $(document).on( 'blur', '#email', function () {
        $(this).mailcheck( {
            suggested: function ( element, suggestion ) {
                var message = 'Did you mean <span class="correction">'
                    + suggestion.full + '</span>?';
                $( '#email-suggestion' )
                    .html( message )
                    .show();
            },
            empty: function ( element ) {
                $( '#emailMsg' )
                    .hide();
            }
        } );
    } );
    $( document ).on( 'click', '#email-suggestion .correction', function () {
        $( '#email' ).val( $( this ).text() );
        $( '#email-suggestion' )
            .hide();
    } );

});

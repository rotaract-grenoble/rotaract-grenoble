// Edit your ics sources here
ics_sources = [
    {url:'https://trello.com/calendar/573acc782bd096f024d677fc/5c5c01ea6c379c05234c6c6d/2aca0d3c07748a49d12672e88f74bf1a.ics', title: 'Rotaract Grenoble-Dauphiné', event_properties: {color: '#D91B5C'}}
]


////////////////////////////////////////////////////////////////////////////
//
// Here be dragons!
//
////////////////////////////////////////////////////////////////////////////

function data_req (url, callback) {
    /*req = new XMLHttpRequest()
    req.addEventListener('load', callback)
    req.open('GET', url)
    req.send()*/

    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    var x = new XMLHttpRequest();
    x.open("GET", cors_api_url + url);
    x.onload = x.onerror = callback;
    x.send();
}

function add_recur_events() {
    if (sources_to_load_cnt < 1) {
        $('#calendar').fullCalendar('addEventSource', expand_recur_events)
    } else {
        setTimeout(add_recur_events, 30)
    }
}


function load_ics(ics, cpt){
    data_req(ics.url, function(){
        $('#calendar').fullCalendar('addEventSource', fc_events(this.response, ics.event_properties))
        sources_to_load_cnt -= 1;
    })
    // Meddling with the HTML to add everything related to our ics feeds dynamically
    // hidden ics feeds
    document.getElementById("ics-feeds").insertAdjacentHTML('beforeend', "<span hidden id='ics-url"+cpt+"'>"+ics.url+"</span>");

    // calendar legend
    document.getElementById("legend-feeds").insertAdjacentHTML('beforeend', "    <div class='calendar-feed'>" +
        "<span class='fc-event-dot' style='background-color: "+ics.event_properties['color']+"'></span>" +
        "<span> "+ics.title+" <button id='copyLink"+cpt+"'>" +
        "<img src='./img/clipboard.svg' alt='copy to clipboard' title='copy to clipboard' width='15px' style='padding-top: 3px;'/></button></span></div>");

    // copy button for ics feeds
    document.querySelector("#copyLink"+cpt).addEventListener("click", function(){copy("ics-url"+cpt);});
}


$(document).ready(function() {

    // display events
    $('#calendar').fullCalendar({
        header: {
            left: 'prev next today',
            center: 'title',
            right: ''//'month,agendaWeek,agendaDay,listWeek,listMonth'
        },
        defaultView: 'listMonth',
        firstDay: '1',
        locale: 'fr',
        lang: 'fr',

        // customize the button names,
        // otherwise they'd all just say "list"
        views: {
          listWeek: { buttonText: 'W' },
          listMonth: { buttonText: 'M' }
        },
	navLinks: true,
	editable: false,
        eventLimit: false, // allow "more" link when too many events
        eventRender: function(event, element, view) {
	  if(view.name == "listMonth" || view.name == "listWeek") {
            var title = element.find('.fc-list-item-title');
            /*title.append('<div style="margin-top:5px;"></div><span style="font-size: 0.9em">'+(event.description || 'no description')+'</span>'+((event.loc) ? ('<span style="margin-top:5px;display: block"><b>Venue: </b>'+event.loc+'</span>') : ' ')+'</div>');*/
            var text = title.text().replace(new RegExp(" \\[.+?\\]$"), "");
            title.html("");
            title.html(text);
	  } else if(view.name == "agendaWeek" || view.name == "agendaDay") {
            element.qtip({
                content: {
                  text: '<small>'+((event.start.format("d") != event.end.format("d")) ? (event.start.format("MMM Do")
                        +(((event.end.subtract(1,"seconds")).format("d") == event.start.format("d")) ? ' ' : ' - '
                        +(event.end.subtract(1,"seconds")).format("MMM Do"))) : (event.start.format("HH:mm")
                        +' - '+event.end.format("HH:mm")))+'</small><br/>'+
		         '<b>'+event.title+'</b>'+
			 ((event.description) ? ('<br/>'+event.description) : ' ')+
			 ((event.loc) ? ('<br/><b>Venue: </b>'+event.loc) : ' ')
                },
                style: {
                    classes: 'qtip-bootstrap qtip-rounded qtip-shadown qtip-light',
                },
                position: {
                    my: 'center left',
                    at: 'center right',
                }
            });
	  } else {
            element.qtip({
                content: {
                  text: '<small>'+((event.start.format("d") != event.end.format("d")) ? (event.start.format("MMM Do")
                        +(((event.end.subtract(1,"seconds")).format("d") == event.start.format("d")) ? ' ' : ' - '
                        +(event.end.subtract(1,"seconds")).format("MMM Do"))) : (event.start.format("HH:mm")
                        +' - '+event.end.format("HH:mm")))+'</small><br/>'+
		         '<b>'+event.title+'</b>'+
			 ((event.description) ? ('<br/>'+event.description) : ' ')+
			 ((event.loc) ? ('<br/><b>Venue: </b>'+event.loc) : ' ')
                },
                style: {
                    classes: 'qtip-bootstrap qtip-rounded qtip-shadown qtip-light',
                },
                position: {
                    my: 'top left',
                    at: 'bottom center',
                }
            });
          }
        }
    })
    sources_to_load_cnt = ics_sources.length
    var cpt = 0;
    for (ics of ics_sources) {
        cpt+=1;
        load_ics(ics, cpt)
    }
    add_recur_events()
})

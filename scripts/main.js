// all dom elements
var allLink = document.getElementById('allLink');
var activeLink = document.getElementById('activeLink');
var completedLink = document.getElementById('completedLink');
var clearCompletedLink = document.getElementById('clearCompleted');
var list = document.getElementById('todoList');
var par = document.getElementById('itemsLeft');
var input = document.getElementById('inputField');
var dropdown = document.getElementById('dropdownButton');

// items array
// keeps every single item object
var items = [];

// count of items for the items count paragraph
var count = 0;

// variable that keeps track of which view type is selected
// ALL = every item (completed & active), ACTIVE = items not completed only, COMPLETED = completed items only
var viewType = 'ALL';

// focus by default on All link
if (allLink) {
    allLink.click();
    allLink.focus();
}

/*
* This broke my application somehow, so I'm just not going to mess with cookies for the time being
* despite the fact that they don't seem complicated AT ALL. JSON.stringify seems to be producing 
* some errors, but I'm probably just using it wrong -- I might come back to this later.
// loads the cookie data for the items (if there is any)
if (getCookie('items')) {
    // should return the items array correctly
    items = JSON.parse(getCookie('items'));
    // loads the cookie data for the items count (if there is any - which there should be if the items cookie isn't empty)
    if (!isEmptyString(getCookie('count'))) {
        count = getCookie('count');
    }
    // loads the cookie data for the viewType (if there is any - which there should be if the items cookie isn't empty)
    if (!isEmptyString(getCookie('viewType'))) {
        viewType = getCookie('viewType');
    }
    selectView(viewType);
    changeView();
    updateParagraph();
} else {
    console.log('Couldn\'t find cookies (not a big deal)!');
    console.log('Cookie data for \'items\' cookie=' + getCookie('items'));
}
*/

// Checks to see if certain dom elements are loaded before doing stuff with them
// Keeps errors from occuring
if (!allLink || !activeLink || !completedLink || !clearCompletedLink || !input || !dropdown) {
    console.log('Couldn\'t find one or more of the bottom links, or the dropdown button, or the input field.');
} else {
    allLink.onclick = function() {
      selectView('ALL');
      return false;
    };
    activeLink.onclick = function() {
      selectView('ACTIVE');
      return false;
    };
    completedLink.onclick = function() {
      selectView('COMPLETED');
      return false;
    };
    clearCompletedLink.onclick = function() {
      // The calls upon calls here may seem stupid, but for some reason (that I couldn't find out) it only cleared some when I called it once
      for (var i = 0, n = items.length; i < n; i++) {
          clearCompleted();
      }
      return false;
    };
    dropdown.onclick = function() {
      toggleShown();
      return false;
    };
    input.onkeypress = function(event) {
        if (!event) event = window.event;
        var keyCode = event.keyCode || event.which;
        if (keyCode == '13'){
            if (isEmptyString(input.value)) return;
            addItem(input.value);
            input.value = '';
        }
    };
}

/*
* Simple reg-ex check to see if a string is just whitespace or empty
* Used when adding an item to the todo list; keeps the user from entering an empty string
*/
function isEmptyString(string) {
    return !/\S/.test(input.value);
}

/*
* Used when the dropdown arrow is clicked to toggle whether or not the items are shown
* TODO: Possibly make it so the dropdown arrow image changes on toggle (visual difference for clarity)
*/
var shown = true;
function toggleShown() {
    if (shown)
        clearShown();
    else
        changeView();
    shown = !shown;
}

/*
* Clears what is shown in the todo list
* Used when changing the view type
*/
function clearShown() {
    if (!list) {
        console.log('Couldn\'t find list element.');
        return;
    }
    list.innerHTML = '';
}

/*
* Adds an item to the items list and sets the item's text to 'itemText', and also assigns other object properties
*/
function addItem(itemText) {
    // create the item & add to list
    var item = new Object();
    item.text = itemText;
    item.id = Math.floor((Math.random() * 100) + 1) + ':' + Math.floor((Math.random() * 100) + 1); // probably overkill for id generation, idek if id generation is needed tbh - but i'm using it
    item.isCompleted = false;
    
    item.p = document.createElement('p');
    var txt = document.createTextNode(item.text);
    item.p.appendChild(txt);
    item.p.id = item.id + '-text';
    
    item.completeButton = document.createElement('a');
    var cLinkText = document.createTextNode('v');
    item.completeButton.className = 'completeButton';
    item.completeButton.style.color = 'green';
    item.completeButton.href = '#';
    item.completeButton.id = item.id + '-cLink';
    item.completeButton.appendChild(cLinkText);
    item.completeButton.onclick = function() {
      item.isCompleted = !item.isCompleted;
      if (item.isCompleted) {
          count--;
          item.p.style.textDecoration = 'line-through';
      } else {
          count++;
          item.p.style.textDecoration = 'none';
      }
      changeView();
      updateParagraph();
      return false;
    };
    
    item.destroyButton = document.createElement('a');
    var dLinkText = document.createTextNode('x');
    item.destroyButton.className = 'destroyButton';
    item.destroyButton.style.color = 'red';
    item.destroyButton.href = '#';
    item.destroyButton.id = item.id + '-dLink';
    item.destroyButton.appendChild(dLinkText);
    item.destroyButton.onclick = function() {
        removeItem(getItemById(item.destroyButton.id.split('-')[0]));
        return false;
    };
    items.push(item);
    count++;
    
    //setCookie('items', JSON.stringify(items), 1);
    //setCookie('count', count, 1);
    //setCookie('viewType', viewType, 1);

    updateParagraph();
    changeView();
}

/*
* Removes 'item' from the items array
*/
function removeItem(item) {
    if (!getItemById(item.id)) return;
    items.splice(items.indexOf(item), 1);
    var row = document.getElementById(item.id + '-row');
    list.removeChild(row);
    if (!item.isCompleted)
        count--;
        
    //setCookie('items', JSON.stringify(items), 1);
    //setCookie('count', count, 1);
    //setCookie('viewType', viewType, 1);
    
    changeView();
    updateParagraph();
}

/*
* Clears all of the completed items
*/
function clearCompleted() {
    for (var i = 0; i < items.length; i++)
        if (items[i].isCompleted)
            removeItem(items[i]);
    changeView();
}

/*
* Basically just updates the todo list to show all the correct items
* Might not be the best name for the function, but idk, it works for me
*/
function changeView() {
    if (!list) {
        console.log('Couldn\'t find list element.');
        return;
    }
    var n = items.length;
    var listItem, listItemLeft, listItemMid, listItemRight;
    if (viewType === 'ALL') {
        clearShown();
        for (var i = 0; i < n; i++) {
            if (document.getElementById(items[i].id)) continue;
            listItem = document.createElement('TR');
            listItem.id = items[i].id + '-row';
            listItemLeft = document.createElement('TD');
            listItemMid = document.createElement('TD');
            listItemMid.className = 'listItemMid';
            listItemRight = document.createElement('TD');
            
            if (items[i].isCompleted) {
                items[i].p.style.textDecoration = 'line-through';
            }
            
            listItemLeft.appendChild(items[i].completeButton);
            listItemMid.appendChild(items[i].p);
            listItemRight.appendChild(items[i].destroyButton);
            listItemLeft.setAttribute('id', items[i].id);
            listItemMid.setAttribute('id', items[i].id);
            listItemRight.setAttribute('id', items[i].id);
            listItem.appendChild(listItemLeft);
            listItem.appendChild(listItemMid);
            listItem.appendChild(listItemRight);
            list.appendChild(listItem);
        }
    } else if (viewType === 'ACTIVE') {
        clearShown();
        for (var i = 0; i < n; i++) {
            if (items[i].isCompleted) continue;
            if (document.getElementById(items[i].id)) continue;
            listItem = document.createElement('TR');
            listItem.id = items[i].id + '-row';
            listItemLeft = document.createElement('TD');
            listItemMid = document.createElement('TD');
            listItemMid.className = 'listItemMid';
            listItemRight = document.createElement('TD');
            
            listItemLeft.appendChild(items[i].completeButton);
            listItemMid.appendChild(items[i].p);
            listItemRight.appendChild(items[i].destroyButton);
            listItemLeft.setAttribute('id', items[i].id);
            listItemMid.setAttribute('id', items[i].id);
            listItemRight.setAttribute('id', items[i].id);
            listItem.appendChild(listItemLeft);
            listItem.appendChild(listItemMid);
            listItem.appendChild(listItemRight);
            list.appendChild(listItem);
        }
    } else if (viewType === 'COMPLETED') {
        clearShown();
        for (var i = 0; i < n; i++) {
            if (items[i].isCompleted === false) continue;
            if (document.getElementById(items[i].id)) continue;
            listItem = document.createElement('TR');
            listItem.id = items[i].id + '-row';
            listItemLeft = document.createElement('TD');
            listItemMid = document.createElement('TD');
            listItemMid.className = 'listItemMid';
            listItemRight = document.createElement('TD');
            
            items[i].p.style.textDecoration = 'line-through';
            
            listItemLeft.appendChild(items[i].completeButton);
            listItemMid.appendChild(items[i].p);
            listItemRight.appendChild(items[i].destroyButton);
            listItemLeft.setAttribute('id', items[i].id);
            listItemMid.setAttribute('id', items[i].id);
            listItemRight.setAttribute('id', items[i].id);
            listItem.appendChild(listItemLeft);
            listItem.appendChild(listItemMid);
            listItem.appendChild(listItemRight);
            list.appendChild(listItem);
        }
    }
}

/*
* Changes the todo item list view to 'view'
*/
function selectView(view) {
    if (view !== viewType) {
        viewType = view;
        clearShown();
        changeView();
    }
}

/*
* Updates the item count paragraph
*/
function updateParagraph() {
    if (!par) {
        console.log('Couldn\'t find paragraph element.');
        return;
    }
    if (count < 0) {
        console.log('ERROR: COUNT IS NEGATIVE');
        return;
    } else if (count === 0) {
        par.innerHTML = 'no items left ';
    } else if (count === 1) {
        par.innerHTML = count + ' item left ';
    } else if (count > 1) {
        par.innerHTML = count + ' items left ';
    }
}

/*
* Gets an item by the given id, if it exists
*/
function getItemById(id) {
    for (var i = 0, n = items.length; i < n; i++) {
        if (id === items[i].id) {
            return items[i];
        }
    }
    return null;
}

// Cookie stuff, for storing list items on reload
// Currently not using this
/*
* Sets the cookie 'cname' to 'cvalue'
*/
/*
* unused for now, so commented out
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
*/

/*
* Gets the cookie 'cname'
*/
/*
* unused for now, so commented out
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}
*/

// All modal stuff basically taken and tweaked from http://www.w3schools.com/howto/howto_css_modals.asp
// It's not just copied/pasted, but a lot of it is from that site
// Modal stuff
// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById('helpButton');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close')[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
    modal.style.display = 'block';
    selectView(viewType);
    return false;
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = 'none';
    selectView(viewType);
    return false;
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
        selectView(viewType);
        return false;
    }
};
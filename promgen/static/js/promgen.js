/*
 * Copyright (c) 2021 LINE Corporation
 * These sources are released under the terms of the MIT license: see LICENSE
 */

function groupByLabel(items, label) {
  const groups = new Map();

  for (const item of items) {
    const key = item.labels[label];
    if (!key) {
      continue;
    }

    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
}

function update_page(data) {
  for (var key in data) {
    console.log("Replacing %s", key);
    var ele = $(data[key]);
    $(key).replaceWith(ele);
  }
}

function doesMatcherMatch(matcher, labelName, labelValue) {
  if (matcher.name !== labelName) {
    return false;
  }

  if (matcher.isRegex) {
    const regex = new RegExp(matcher.value);
    const matches = regex.test(labelValue);
    return matcher.isEqual ? matches : !matches;
  } else {
    return matcher.isEqual ?
      (matcher.value === labelValue) :
      (matcher.value !== labelValue);
  }
}

function getActiveSilences(items, labelName, labelValue) {
  const activeSilences = [];
  for (const item of items) {
    const matches = item.matchers.some(matcher =>
      doesMatcherMatch(matcher, labelName, labelValue)
    );
    if (matches) {
      activeSilences.push(item);
    }
  }
  return activeSilences;
}

// https://blog.bitsrc.io/debounce-understand-and-learn-how-to-use-this-essential-javascript-skill-9db0c9afbfc1
function debounce(func, delay = 250) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Wait until DOM is loaded to add our extra listeners
document.addEventListener("DOMContentLoaded", function () {
  /*
    Copy to shortcut

    Example: <code data-copyto="#id_duration">30s</code>
  */
  document.querySelectorAll("[data-copyto]").forEach(srcElement => {
    srcElement.style.cursor = "pointer";
    srcElement.addEventListener("click", e => {
      const dstElement = document.querySelector(srcElement.dataset.copyto);
      dstElement.value = srcElement.innerText;
    });
  });

  /*
  Filter Element

  Example: <input data-filter="div.auto-grid div">
  */
  document.querySelectorAll("[data-filter]").forEach(srcElement => {
    const filterTarget = document.querySelectorAll(srcElement.dataset.filter);

    srcElement.addEventListener(
      "input",
      debounce(e => {
        const search = srcElement.value.toUpperCase();
        console.debug("Searching for", search);
        for (const child of filterTarget) {
          const txt = child.innerText.toUpperCase();
          child.style.display = txt.indexOf(search) > -1 ? "block" : "none";
        }
      })
    );
  });
});

$(document).ready(function() {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();

  $('[data-source]').click(function() {
    var btn = $(this);
    var query = btn.data('source') === 'self' ? btn.text() : $(btn.data('source')).val();

    $(btn.data('target')).html('Loading...').show();
    btn.data('query', query);
    console.log("Testing Query: %s", query);
    $.post(btn.data('href'), btn.data()).done(update_page);
  }).css('cursor', 'pointer');

  $('[data-toggle="toggle"]').bootstrapSwitch();
  $('[data-toggle="toggle"][data-action]').on('switchChange.bootstrapSwitch', function(event, state) {
    if (window.confirm("Are you sure?")) {
      $.post(this.dataset.action, this.dataset).done(function(data){
        // Ideally we would directly update things that need to be updated
        // but a page redraw is a bit easier since that also allows us to
        // update our page messages
        window.location = data.redirect
      });
    } else {
      // If we click the cancel button, then we restore the old state and
      // use the third parameter to skip re-firing the change event
      $(this).bootstrapSwitch('state', !state, true);
    }
  });
});

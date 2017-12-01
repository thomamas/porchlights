/* Copyright 2017 Thomas Insel <tinsel@tinsel.org>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied.  See the License for the specific language
 * governing permissions and limitations under the License.
 */

var base_url = $('script').last().attr('data-url');

function getState() {
  var req = new XMLHttpRequest();
  req.open('GET', base_url + "/outlets/0", false);
  req.send(null);
  return req.responseText;
}

function updateState() {
  l = getState().split('');

  for (var i=0; i<l.length; i++) {
    var offid = "" + (i+1) + "0";
    var onid = "" + (i+1) + "1";
    var state = l[i];

    if (state == 1) {
      $("#" + onid).addClass('highlight');
      $("#" + offid).removeClass('highlight');
    } else {
      $("#" + offid).addClass('highlight');
      $("#" + onid).removeClass('highlight');
    }

  }

}

function doPost(number, state) {
  var req = new XMLHttpRequest();
  req.open("POST", base_url + "/outlets/" + number, true);
  req.onload = updateState;
  req.send(state);
}

function allOn() { doPost(0, '11111111'); }

function allOff() { doPost(0, '00000000'); }

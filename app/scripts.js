var cs = new CSInterface();

function on(id, event, handler) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

var _busy = false;
var _queue = [];
var MAX_QUEUE = 1;
var _currentExpr = '';
var previewInterval = null;
var syncedTextColor = null;
var basicColors = [
    "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF", "#880000", "#AA0000",
    "#CC0000", "#EE0000", "#FF3333", "#FF6666", "#FF9999", "#FFCCCC", "#880044", "#AA0055",
    "#CC0066", "#EE0077", "#FF3388", "#FF66AA", "#FF99CC", "#FFCCEE", "#440088", "#6600AA",
    "#8800CC", "#AA00EE", "#BB33FF", "#CC66FF", "#DD99FF", "#EEAAFF", "#004488", "#0066AA",
    "#0088CC", "#00AAEE", "#33BBFF", "#66CCFF", "#99DDFF", "#CCEEFF", "#008800", "#00AA00",
    "#00CC00", "#00EE00", "#33FF33", "#66FF66", "#99FF99", "#CCFFCC", "#888800", "#AAAA00",
    "#CCCC00", "#EEEE00", "#FFFF33", "#FFFF66", "#FFFF99", "#FFFFCC", "#884400", "#AA6600",
    "#CC8800", "#EEAA00", "#FFBB33", "#FFCC66", "#FFDD99", "#FFEECC", "#888888", "#AAAAAA"
];
var cachedPopupWidth = 0;
var cachedPopupHeight = 0;
var globalColorPickerListenerAdded = false;
var _patternData = {
    1:{4:[2,2],6:[2,2,2],7:[2,3,2],8:[2,4,2],10:[2,3,3,2],11:[2,3,3,3],13:[2,4,4,3],14:[3,4,4,3],15:[4,4,4,3],17:[2,4,5,4,2],20:[3,5,5,4,3],24:[3,4,5,5,4,3],30:[4,5,7,6,5,3],18:[2,4,6,4,2], 19:[2,4,7,4,2], 21:[2,5,7,5,2], 22:[2,5,8,5,2], 23:[2,5,9,5,2], 25:[2,6,9,6,2], 26:[2,6,10,6,2], 27:[2,7,9,7,2], 28:[2,7,10,7,2], 29:[2,8,9,8,2], 31:[2,4,6,7,6,4,2], 32:[2,4,6,8,6,4,2], 33:[2,4,7,7,7,4,2], 34:[2,4,7,8,7,4,2], 35:[2,4,7,9,7,4,2], 36:[2,4,8,8,8,4,2], 37:[2,4,8,9,8,4,2], 38:[2,4,8,10,8,4,2], 39:[2,5,8,9,8,5,2], 40:[2,5,8,10,8,5,2]},
    2:{4:[2,2],6:[3,3],7:[4,3],8:[2,3,3],10:[3,4,3],11:[4,4,3],13:[3,6,4],14:[2,4,4,3],15:[5,6,5],17:[3,5,6,3],20:[4,5,6,5],24:[4,6,6,5,3],30:[4,7,8,7,4],18:[3,4,4,4,3], 19:[3,4,5,4,3], 21:[3,5,5,5,3], 22:[3,5,6,5,3], 23:[3,6,5,6,3], 25:[3,6,7,6,3], 26:[3,6,8,6,3], 27:[3,7,7,7,3], 28:[3,7,8,7,3], 29:[3,7,9,7,3], 31:[4,7,9,7,4], 32:[4,7,10,7,4], 33:[4,8,9,8,4], 34:[4,8,10,8,4], 35:[3,5,6,7,6,5,3], 36:[3,5,6,8,6,5,3], 37:[3,5,7,7,7,5,3], 38:[3,5,7,8,7,5,3], 39:[3,5,8,8,8,5,3], 40:[3,5,8,9,8,5,3]},
    3:{4:[1,2,1],6:[1,2,3],7:[1,2,3,1],8:[1,2,3,2],10:[1,2,4,3],11:[1,2,3,3,2],13:[2,4,4,3],14:[2,5,4,3],15:[2,4,5,4],17:[2,4,5,4,2],18:[2,4,5,5,2],19:[2,4,5,5,2],20:[2,4,6,4,4],21:[2,4,6,5,4],23:[2,4,6,5,4,2],24:[2,4,6,5,4,3],25:[3,6,8,6,4],27:[2,4,6,6,5,4],29:[4,7,8,6,4],30:[2,5,7,6,6,4],31:[2,4,6,6,5,4,4],33:[3,6,8,6,6,5],22:[2,4,5,5,4,2], 26:[2,4,7,7,4,2], 28:[2,4,7,9,4,2], 32:[2,4,6,8,6,4,2], 34:[2,4,7,8,7,4,2], 35:[2,4,7,9,7,4,2], 36:[2,4,8,8,8,4,2], 37:[2,4,8,9,8,4,2], 38:[2,4,8,10,8,4,2], 39:[2,5,8,9,8,5,2], 40:[2,5,8,10,8,5,2]},
    4:{4:[2,2],6:[2,4],7:[2,2,3],8:[2,3,3],10:[2,4,4],11:[2,4,3,2],13:[3,6,4],14:[3,7,4],15:[2,5,6,2],18:[3,5,6,4],17:[2,5,6,4],20:[3,7,6,4],21:[3,6,7,5],23:[3,6,7,5,2],24:[3,7,6,5,3],25:[2,4,6,6,4,3],27:[3,6,8,6,4],29:[3,5,7,5,5,4],30:[3,7,7,7,6],31:[3,7,8,7,6],33:[4,8,8,7,7],19:[3,4,5,4,3], 22:[3,5,6,5,3], 26:[3,6,8,6,3], 28:[3,7,8,7,3], 32:[3,5,8,8,5,3], 34:[3,5,9,9,5,3], 35:[3,5,9,10,5,3], 36:[3,6,9,9,6,3], 37:[3,6,10,9,6,3], 38:[3,6,10,10,6,3], 39:[3,7,9,10,7,3], 40:[3,7,10,10,7,3]},
    5:{4:[1,2,1],6:[3,2,1],7:[1,2,2,2],8:[2,3,2,1],10:[1,4,3,2],11:[2,3,4,2],13:[3,4,4,2],14:[3,4,4,2,1],15:[2,3,4,4,2],17:[3,4,4,4,2],20:[3,5,5,5,2],24:[3,4,5,5,5,2],30:[4,5,6,6,6,3],18:[2,3,4,4,3,2], 19:[2,3,4,5,3,2], 21:[2,3,5,6,3,2], 22:[2,3,5,7,3,2], 23:[2,3,6,7,3,2], 25:[2,4,6,7,4,2], 26:[2,4,6,8,4,2], 27:[2,4,7,8,4,2], 28:[2,4,7,9,4,2], 29:[2,4,8,9,4,2], 31:[2,4,6,7,6,4,2], 32:[2,4,6,8,6,4,2], 33:[2,4,7,7,7,4,2], 34:[2,4,7,8,7,4,2], 35:[2,4,7,9,7,4,2], 36:[2,4,8,8,8,4,2], 37:[2,4,8,9,8,4,2], 38:[2,4,8,10,8,4,2], 39:[2,5,8,9,8,5,2], 40:[2,5,8,10,8,5,2]},
    6:{4:[2,2],6:[4,2],7:[2,2,2,1],8:[3,3,2],10:[4,4,2],11:[1,4,4,2],13:[4,6,3],14:[5,6,3],15:[5,6,4],17:[4,6,4,3],20:[5,6,6,3],24:[6,7,7,4],26:[5,5,8,5,3],30:[6,7,7,7,3],18:[2,3,4,4,3,2], 19:[2,3,4,5,3,2], 21:[2,3,5,6,3,2], 22:[2,3,5,7,3,2], 23:[2,3,6,7,3,2], 25:[2,4,6,7,4,2], 27:[2,4,7,8,4,2], 28:[2,4,7,9,4,2], 29:[2,4,8,9,4,2], 31:[2,5,5,7,5,5,2], 32:[2,5,5,8,5,5,2], 33:[2,5,6,7,6,5,2], 34:[2,5,6,8,6,5,2], 35:[2,5,7,7,7,5,2], 36:[2,5,7,8,7,5,2], 37:[2,5,7,9,7,5,2], 38:[2,5,8,8,8,5,2], 39:[2,5,8,9,8,5,2], 40:[2,5,8,10,8,5,2]},
    7:{4:[2,2],6:[2,2,2],7:[3,4],8:[2,4,2],10:[2,3,3,2],11:[2,3,3,3],12:[2,4,3,3],13:[3,3,4,3],14:[2,4,5,3],15:[2,5,4,4],16:[2,3,4,4,3],17:[2,4,5,4,2],18:[3,4,4,4,3],20:[2,5,5,5,3],23:[3,4,6,4,4,2],24:[2,3,5,6,5,3],26:[3,4,4,5,5,3,2],30:[2,6,7,6,6,3],19:[2,3,4,4,3,3], 21:[2,3,4,5,4,3], 22:[2,3,5,5,4,3], 25:[2,4,5,6,5,3], 27:[2,4,6,6,5,4], 28:[2,4,6,7,5,4], 29:[2,4,7,7,5,4], 31:[2,4,6,7,6,4,2], 32:[2,4,6,8,6,4,2], 33:[2,4,7,7,7,4,2], 34:[2,4,7,8,7,4,2], 35:[2,4,7,9,7,4,2], 36:[2,4,8,8,8,4,2], 37:[2,4,8,9,8,4,2], 38:[2,4,8,10,8,4,2], 39:[2,5,8,9,8,5,2], 40:[2,5,8,10,8,5,2]},
    8:{4:[2,2],6:[3,2,2],7:[3,3,1],8:[3,3,2],10:[3,3,2,2],11:[3,5,3],12:[2,4,4,2],13:[3,5,3,2],14:[3,5,4,2],15:[3,5,5,2],17:[3,3,5,4,2],20:[3,5,6,4,2],21:[3,5,5,5,3],24:[3,5,6,5,3,2],26:[3,5,5,6,4,3],30:[3,6,8,7,4,2],18:[3,4,4,4,3], 19:[3,4,5,4,3], 22:[3,5,6,5,3], 23:[3,5,7,5,3], 25:[3,6,7,6,3], 27:[3,7,7,7,3], 28:[3,7,8,7,3], 29:[3,7,9,7,3], 31:[3,5,7,8,5,3], 32:[3,5,8,8,5,3], 33:[3,5,8,9,5,3], 34:[3,6,8,8,6,3], 35:[3,6,8,9,6,3], 36:[3,6,9,9,6,3], 37:[3,6,9,10,6,3], 38:[3,7,9,9,7,3], 39:[3,7,10,9,7,3], 40:[3,7,10,10,7,3]},
    9:{4:[2,2],5:[2,2,1],6:[2,3,1],7:[3,4],8:[3,2,3],10:[4,3,3],11:[4,3,4],13:[4,4,3,2],14:[4,4,3,3],15:[3,4,5,3],17:[4,5,4,4],19:[3,4,5,4,3],20:[4,5,5,4,2],24:[4,5,6,5,4],30:[4,5,6,6,6,4],18:[2,3,4,4,3,2], 21:[2,3,5,6,3,2], 22:[2,3,5,7,3,2], 23:[2,3,6,7,3,2], 25:[2,4,6,7,4,2], 26:[2,4,6,8,4,2], 27:[2,4,7,8,4,2], 28:[2,4,7,9,4,2], 29:[2,4,8,9,4,2], 31:[2,4,6,7,6,4,2], 32:[2,4,6,8,6,4,2], 33:[2,4,7,7,7,4,2], 34:[2,4,7,8,7,4,2], 35:[2,4,7,9,7,4,2], 36:[2,4,8,8,8,4,2], 37:[2,4,8,9,8,4,2], 38:[2,4,8,10,8,4,2], 39:[2,5,8,9,8,5,2], 40:[2,5,8,10,8,5,2]}
};

function getCasePreview(text, n) {
    var words = text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().split(" ");
    var total = words.length;
    var map = _patternData[n];
    if (!map) return text;
    var closestKey = null, minDiff = 9999;
    for (var k in map) {
        var diff = Math.abs(total - parseInt(k));
        if (diff < minDiff) { minDiff = diff; closestKey = k; }
    }
    var pattern = map[closestKey].slice();
    var sum = pattern.reduce(function(a,b){return a+b;},0);
    if (total > sum) {
        var extra = total - sum;
        var len = pattern.length;
        if (len % 2 == 1) pattern[Math.floor(len/2)] += extra;
        else {
            var m1 = Math.floor(len/2)-1, m2 = Math.floor(len/2);
            pattern[m1] += Math.floor(extra/2);
            pattern[m2] += extra - Math.floor(extra/2);
        }
    }
    var lines = [], idx = 0;
    for (var i = 0; i < pattern.length; i++) {
        var lineWords = [];
        for (var j = 0; j < pattern[i]; j++) if (words[idx]) lineWords.push(words[idx++]);
        lines.push(lineWords.join(" "));
    }
    return lines.join("\n");
}

(function() {
    try {
        var raw = cs.getSystemPath(SystemPath.EXTENSION);
        var extPath = raw.split("\\").join("/");
        var jsxPath = extPath + "/app/host.jsx";
        cs.evalScript('$.evalFile(new File("' + jsxPath + '")); "LOADED";', function(res) { console.log("[TypoCore] JSX:", res); });
    } catch(e) { console.error(e); }
})();

function _isNoQueueTask(expr) { return expr.startsWith('applyCase') || expr.startsWith('splitEven'); }

function _executeNow(expr, btn, onDone) {
    if (_busy) return;
    _busy = true;
    _currentExpr = expr;
    
    // Chỉ xóa focus/active ngay lập tức, không disable
    if (btn) btn.blur();
    
    cs.evalScript(expr, function(result) {
        _busy = false;
        _currentExpr = '';
        // Sau khi xong, lại blur một lần nữa (đề phòng)
        if (btn) btn.blur();
        if (onDone) onDone(result);
        _processQueue();
    });
}
function _processQueue() {
    if (_busy || _queue.length === 0) return;
    var task = _queue.shift();
    _executeNow(task.expr, task.btn, task.onDone);
}
function _exec(expr, btn, onDone) {
    if (!_busy) { _executeNow(expr, btn, onDone); return; }
    if (_isNoQueueTask(expr) || _queue.length >= MAX_QUEUE || _currentExpr === expr) return;
    _queue.push({ expr: expr, btn: btn, onDone: onDone });
}
function runBtn(expr, el) { _exec(expr, el); }

var BAD = { "ERROR":1, "NO_LAYER":1, "NO_FX":1, "NO_PATH":1, "NO_FILE":1, "NO_DOC":1, "NO_TEXT":1, "NO_OTHER_DOC":1 };
function flash(btn, result) {
    if (!btn) return;
    var bad = !result || BAD[result] || (result+"").includes("ERROR");
    btn.classList.remove("flash-ok", "flash-err");
    btn.classList.add(bad ? "flash-err" : "flash-ok");
    setTimeout(function() { btn.classList.remove("flash-ok", "flash-err"); }, 500);
}

var _step = 3;
var sizeInput = document.getElementById("sizeDisplay");
var isEditing = false;

function updateStepUI() { if (!isEditing) sizeInput.value = _step; }
function applyStepInput() {
    if (!isEditing) return;
    var val = parseInt(sizeInput.value, 10);
    if (isNaN(val)) val = _step;
    val = Math.max(1, Math.min(999, val));
    _step = val;
    sizeInput.value = _step;
    sizeInput.readOnly = true;
    sizeInput.style.backgroundColor = "#222";
    isEditing = false;
}
if (sizeInput) {
    sizeInput.addEventListener("click", function(e) {
        if (isEditing) return;
        isEditing = true;
        sizeInput.readOnly = false;
        sizeInput.focus();
        sizeInput.select();
        sizeInput.style.backgroundColor = "#2a2a2a";
    });
    sizeInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") { e.preventDefault(); applyStepInput(); sizeInput.blur(); }
    });
    sizeInput.addEventListener("focusout", function(e) {
        setTimeout(function() { if (isEditing && document.activeElement !== sizeInput) applyStepInput(); }, 10);
    });
}
function changeStep(delta) { if (isEditing) return; _step = Math.min(50, Math.max(1, _step + delta)); updateStepUI(); }
function applySize(sign) { if (isEditing) return; var d = _step * sign; _exec('applyNow(' + d + ',' + d + ')', document.getElementById(sign > 0 ? "btnPlus" : "btnMinus")); }
updateStepUI();

function doCopyFX() {
    var btn = document.getElementById("btnCopyFX");
    _exec('copyFX()', btn, function(res) { if (res === "OK") document.getElementById("btnPasteFX").disabled = false; });
}
function doPasteFX() {
    var btn = document.getElementById("btnPasteFX");
    _exec('pasteFX()', btn, function(res) {
        if (res === "OK") { var vis = loadVis(); if (!vis.multiplePaste) btn.disabled = true; }
    });
}

var STORAGE_KEY = "typoCoreToolVisibility";
var TOOL_DEFS = {
    quickLayout: { sectionId: "section-preview", isSection: true },
    fxManager:   { sectionId: "section-fx",      isSection: true },
    layoutCases: { sectionId: "section-layout", isSection: true },
    splitEven:   { sectionId: "section-split",   isSection: true },
    fontSize:    { sectionId: "section-size",    isSection: true },
    actionsSection: { sectionId: "section-actions", isSection: true },
    resizeBox:   { dataTool: "resizeBox", isSection: false },
    center:      { dataTool: "center",    isSection: false },
    groupText:   { dataTool: "groupText", isSection: false },
    checkBG:     { dataTool: "checkBG",   isSection: false },
    copyFX:      { dataTool: "copyFX",    isSection: false },
    pasteFX:     { dataTool: "pasteFX",   isSection: false },
    selectForm:  { dataTool: "selectForm", isSection: false },
    logo:        { dataTool: "logo",       isSection: false },
    multiplePaste: { dataTool: "nonexistent", isSection: false },
    manualLoadText: { dataTool: "nonexistent2", isSection: false }
};

function loadVis() {
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { var data = JSON.parse(raw); if (typeof data.multiplePaste === "undefined") data.multiplePaste = false; return data; }
    } catch(e) {}
    var vis = {};
    for (var k in TOOL_DEFS) vis[k] = true;
    vis.multiplePaste = false;
    return vis;
}
function saveVis(vis) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vis)); } catch(e) {} }
function applyVis(vis) {
    for (var key in TOOL_DEFS) {
        var def = TOOL_DEFS[key];
        var show = vis[key] !== false;
        var actionsSection = document.getElementById("section-actions");
        if (actionsSection) {
            var isActionsVisible = window.getComputedStyle(actionsSection).display !== "none";
            if (!isActionsVisible) document.body.classList.add("actions-hidden");
            else document.body.classList.remove("actions-hidden");
        }
        if (def.isSection) {
            var el = document.getElementById(def.sectionId);
            if (el) el.style.display = show ? "" : "none";
        } else {
            var btn = document.querySelector('[data-tool="' + def.dataTool + '"]');
            if (btn) btn.style.display = show ? "" : "none";
        }
    }
    // Ẩn/hiện các hàng action dựa trên nút hiển thị
    var rows = document.querySelectorAll('.action-row');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var btns = row.querySelectorAll('[data-tool]');
        var hasVisible = false;
        for (var j = 0; j < btns.length; j++) {
            if (btns[j].style.display !== 'none') {
                hasVisible = true;
                break;
            }
        }
        row.style.display = hasVisible ? '' : 'none';
    }
    requestAnimationFrame(function() { cs.resizeContent(document.body.scrollWidth, document.body.scrollHeight); });
    updateCheckboxes(vis);
}

function updateCheckboxes(vis) {
    for (var key in TOOL_DEFS) {
        var cb = document.getElementById("toggle_" + key);
        if (cb) cb.checked = vis[key] !== false;
    }
}

var LAYOUT_KEY = "typoCoreLayout";
var _editMode = false;
var sortableSections = null;
var sortableButtons = [];

function toggleEditMode() {
    _editMode = !_editMode;
    document.body.classList.toggle("edit-mode", _editMode);
    var editModeBtns = document.getElementById("editModeButtons");
    if (editModeBtns) editModeBtns.style.display = _editMode ? "flex" : "none";
    if (_editMode) {
        var settingPopup = document.getElementById("settingPopup");
        if (settingPopup) settingPopup.classList.remove("show");
        if (!sortableSections) {
            sortableSections = new Sortable(document.querySelector('.panel'), { animation: 150, handle: '.section', draggable: '.section', disabled: false, onEnd: saveLayout });
        } else { sortableSections.enable(); }
        initButtonSortable();
        enableAllButtonSortable(true);
    } else {
        if (sortableSections) { sortableSections.destroy(); sortableSections = null; }
        sortableButtons.forEach(function(s) { if (s) s.destroy(); });
        sortableButtons = [];
	cleanEmptyActionRows();
        document.querySelectorAll('.action-row').forEach(function(row) { if (row.querySelectorAll('[data-tool]').length === 0) row.remove(); });
        saveLayout();
    }
}
function initSortableForAllRows() {
    var rows = document.querySelectorAll('.action-row');
    // Hủy các sortable cũ
    sortableButtons.forEach(function(s) { if(s) s.destroy(); });
    sortableButtons = [];
    rows.forEach(function(row) {
        var sort = new Sortable(row, {
            group: { name: 'actions-group', pull: true, put: ['actions-group'] },
            animation: 200,
            draggable: '[data-tool]',
            onEnd: function() {
                // Sau khi kéo thả, xóa các hàng trống
                cleanEmptyActionRows();
                saveLayout();
            }
        });
        sortableButtons.push(sort);
    });
}

function cleanEmptyActionRows() {
    var actionGrid = document.querySelector('.action-grid');
    if (!actionGrid) return;
    var rows = actionGrid.querySelectorAll('.action-row');
    var hasRowWithButtons = false;
    rows.forEach(function(row) {
        var btns = row.querySelectorAll('[data-tool]');
        if (btns.length === 0) {
            row.remove();  // xóa hàng trống
        } else {
            hasRowWithButtons = true;
        }
    });
    // Nếu không còn hàng nào có nút, thêm một hàng mặc định
    if (!hasRowWithButtons && actionGrid.children.length === 0) {
        var defaultRow = document.createElement('div');
        defaultRow.className = 'action-row';
        // Thêm hai nút mặc định (Resize, Center) để có gì đó
        var resizeBtn = document.querySelector('[data-tool="resizeBox"]');
        var centerBtn = document.querySelector('[data-tool="center"]');
        if (resizeBtn && centerBtn) {
            defaultRow.appendChild(resizeBtn.cloneNode(true));
            defaultRow.appendChild(centerBtn.cloneNode(true));
        }
        actionGrid.appendChild(defaultRow);
        initSortableForAllRows(); // cập nhật sortable mới
    }
}

function initButtonSortable() { initSortableForAllRows(); }
function addNewRow() {
    var actionGrid = document.querySelector('.action-grid');
    if (!actionGrid) return;
    var newRow = document.createElement('div');
    newRow.className = 'action-row';
    newRow.style.display = 'flex';
    actionGrid.appendChild(newRow);
    var sort = new Sortable(newRow, { group: { name: 'actions-group', pull: true, put: ['actions-group'] }, animation: 200, draggable: '[data-tool]', onEnd: function() { saveLayout(); } });
    sortableButtons.push(sort);
    saveLayout();
}
function enableAllButtonSortable(enable) { sortableButtons.forEach(function(sort) { if (enable) sort.enable(); else sort.disable(); }); }
function saveLayout() {
    var sections = [];
    var sectionElements = document.querySelectorAll('.panel > .section');
    for (var i = 0; i < sectionElements.length; i++) { var sec = sectionElements[i]; var id = sec.getAttribute('data-drag-id') || sec.id; sections.push(id); }
    var actionButtons = [];
    var rows = document.querySelectorAll('.action-row');
    for (var r = 0; r < rows.length; r++) {
        var tools = [];
        var btns = rows[r].querySelectorAll('[data-tool]');
        for (var b = 0; b < btns.length; b++) tools.push(btns[b].getAttribute('data-tool'));
        if (tools.length) actionButtons.push(tools);
    }
    var layout = { sections: sections, actionButtons: actionButtons };
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); } catch(e) {}
}
function restoreLayout() {
    try {
        var raw = localStorage.getItem(LAYOUT_KEY);
        var panel = document.querySelector('.panel');
        if (raw) {
            var layout = JSON.parse(raw);
            if (layout.sections) {
                for (var i = 0; i < layout.sections.length; i++) {
                    var id = layout.sections[i];
                    var sec = document.querySelector('[data-drag-id="' + id + '"]') || document.getElementById(id);
                    if (sec) panel.appendChild(sec);
                }
                var footer = document.querySelector('.panel-footer');
                if (footer) panel.appendChild(footer);
            }
        }
        var actionGrid = document.querySelector('.action-grid');
        var existingButtons = document.querySelectorAll('[data-tool]');
        var btnMap = {};
        existingButtons.forEach(function(btn) { var tool = btn.getAttribute('data-tool'); btnMap[tool] = btn; btn.style.display = ''; });
        actionGrid.innerHTML = '';
        var rowsToCreate = [];
        if (raw && layout.actionButtons && layout.actionButtons.length) rowsToCreate = layout.actionButtons;
        else rowsToCreate = [['resizeBox', 'center'], ['groupText', 'checkBG'], ['copyFX', 'pasteFX'], ['selectForm', 'logo']];
        rowsToCreate.forEach(function(tools) {
            var row = document.createElement('div'); row.className = 'action-row';
            tools.forEach(function(tool) { var btn = btnMap[tool]; if (btn) row.appendChild(btn); });
            if (row.children.length > 0) actionGrid.appendChild(row);
        });
        var vis = loadVis();
        applyVis(vis);
	cleanEmptyActionRows();
        if (_editMode) { initButtonSortable(); enableAllButtonSortable(true); }
    } catch(e) { console.log(e); }
}
function resetLayout() {
    localStorage.removeItem(LAYOUT_KEY);
    var panel = document.querySelector('.panel');
    var order = ['section-fx', 'section-preview', 'section-split', 'section-size', 'section-actions'];
    order.forEach(function(id) { var sec = document.getElementById(id); if (sec) panel.appendChild(sec); });
    var footer = document.querySelector('.panel-footer'); if (footer) panel.appendChild(footer);
    document.getElementById('section-layout').style.display = 'none';
    var vis = loadVis();
    for (var k in TOOL_DEFS) vis[k] = (k === 'layoutCases' || k === 'manualLoadText') ? false : true;
    saveVis(vis); applyVis(vis);
    var actionGrid = document.querySelector('.action-grid');
    var allBtns = document.querySelectorAll('[data-tool]');
    var btnMap = {};
    allBtns.forEach(function(btn) { btnMap[btn.getAttribute('data-tool')] = btn; btn.style.display = ''; });
    actionGrid.innerHTML = '';
    var defaultRows = [['resizeBox', 'center'], ['groupText', 'checkBG'], ['copyFX', 'pasteFX'], ['selectForm', 'logo']];
    defaultRows.forEach(function(tools) {
        var row = document.createElement('div'); row.className = 'action-row';
        tools.forEach(function(tool) { if (btnMap[tool]) row.appendChild(btnMap[tool]); });
        actionGrid.appendChild(row);
    });
    if (_editMode) { initButtonSortable(); enableAllButtonSortable(true); }
    flash(document.getElementById("settingBtn"), "OK");
}
function createDefaultActionRows() {
    var actionGrid = document.querySelector('.action-grid'); actionGrid.innerHTML = '';
    var defaultRows = [['resizeBox', 'center'], ['groupText', 'checkBG'], ['copyFX', 'pasteFX'], ['selectForm', 'logo']];
    defaultRows.forEach(function(tools) {
        var row = document.createElement('div'); row.className = 'action-row';
        tools.forEach(function(tool) { var btn = document.querySelector('[data-tool="' + tool + '"]'); if (btn) row.appendChild(btn); });
        actionGrid.appendChild(row);
    });
}
function saveAndExitEditMode() { if (!_editMode) return; toggleEditMode(); }

function setupSettingPopup() {
    var btn = document.getElementById("settingBtn");
    var popup = document.getElementById("settingPopup");
    var layoutManagerSub = document.getElementById("layoutManagerSub");
    var layoutManagerArrow = document.getElementById("layoutManagerArrow");
    var toolManagerSub = document.getElementById("toolManagerSub");
    var toolManagerArrow = document.getElementById("toolManagerArrow");
    function closeSettingPopup() {
        popup.classList.remove("show");
        if (layoutManagerSub) layoutManagerSub.style.display = "none";
        if (layoutManagerArrow) layoutManagerArrow.textContent = "▼";
        if (toolManagerSub) toolManagerSub.style.display = "none";
        if (toolManagerArrow) toolManagerArrow.textContent = "▼";
    }
    function openSettingPopup() {
        if (layoutManagerSub) layoutManagerSub.style.display = "none";
        if (layoutManagerArrow) layoutManagerArrow.textContent = "▼";
        if (toolManagerSub) toolManagerSub.style.display = "none";
        if (toolManagerArrow) toolManagerArrow.textContent = "▼";
        popup.classList.add("show");
    }
    if (btn) {
        btn.addEventListener("click", function(e) { e.stopPropagation(); if (popup.classList.contains("show")) closeSettingPopup(); else openSettingPopup(); });
    }
    document.addEventListener("click", function(e) { if (!popup.contains(e.target) && e.target !== btn) closeSettingPopup(); });
    popup.querySelectorAll("[data-action]").forEach(function(item) {
        item.addEventListener("click", function(e) {
            var action = this.getAttribute("data-action");
            if (action === "chooseLogo") {
                cs.evalScript('pickLogoPath()', function(result) {
                    if (!result || result === "CANCELLED") return;
                    if (result.indexOf("ERROR") !== -1) return;
                    localStorage.setItem("typoCoreLogoPath", result);
                    cs.evalScript('LOGO_PATH = "' + result.replace(/"/g, '\\"') + '"');
                    var btnLogo = document.getElementById("btnLogo");
                    if (btnLogo) { btnLogo.title = result; btnLogo.classList.add("flash-ok"); setTimeout(function() { btnLogo.classList.remove("flash-ok"); }, 800); }
                });
            } else if (action === "pasteAllOpened") {
                _exec("pasteLogoToAllDocs()", null, function(res) { if (res !== "OK") alert("Lỗi: " + res); });
            } else if (action === "toggleEditMode") { toggleEditMode(); closeSettingPopup(); return; }
            else if (action === "resetLayout") { resetLayout(); }
            closeSettingPopup();
        });
    });
    popup.querySelectorAll("input[type='checkbox']").forEach(function(cb) {
        cb.addEventListener("click", function(e) {
            e.stopPropagation();
            var key = this.id.replace("toggle_", "");
            if (TOOL_DEFS.hasOwnProperty(key)) {
                var vis = loadVis(); vis[key] = this.checked; saveVis(vis); applyVis(vis);
                if (key === "manualLoadText") {
                    var overlay = document.getElementById("previewOverlay");
                    if (overlay && overlay.style.display === "block") {
                        if (vis.manualLoadText) { if (previewInterval) { clearInterval(previewInterval); previewInterval = null; } }
                        else { if (!previewInterval) previewInterval = setInterval(window.updatePreviewIfNeeded, 1000); }
                    }
                }
            }
        });
    });
    var layoutToggle = document.getElementById("layoutManagerToggle");
    if (layoutToggle) {
        layoutToggle.addEventListener("click", function(e) { e.stopPropagation(); if (layoutManagerSub.style.display === "none") { layoutManagerSub.style.display = "block"; layoutManagerArrow.textContent = "▲"; } else { layoutManagerSub.style.display = "none"; layoutManagerArrow.textContent = "▼"; } });
    }
    var toolToggle = document.getElementById("toolManagerToggle");
    if (toolToggle) {
        toolToggle.addEventListener("click", function(e) { e.stopPropagation(); if (toolManagerSub.style.display === "none") { toolManagerSub.style.display = "block"; toolManagerArrow.textContent = "▲"; } else { toolManagerSub.style.display = "none"; toolManagerArrow.textContent = "▼"; } });
    }
    updateCheckboxes(loadVis());
}

function setupPreviewPopup() {
    var overlay = document.getElementById("previewOverlay");
    var btnOpen = document.getElementById("btnPreviewLayout");
    var btnLoad = document.getElementById("btnPreviewLoad");
    var btnClose = document.getElementById("btnPreviewClose");
    var btnToggle = document.getElementById("btnPreviewToggle");
    if (btnToggle) btnToggle.textContent = "H";
    var grid = document.getElementById("previewGrid");
    var lastPreviewText = "";
    var isHorizontal = false;
    var customFonts = [];
    var selectedFontIndex = -1;
    var previewSize = 14;
    var maxFonts = 5;
    var btnFont = document.getElementById("btnPreviewFont");
    var btnSizeDown = document.getElementById("btnPreviewSizeDown");
    var btnSizeUp = document.getElementById("btnPreviewSizeUp");
    var sizeDisplay = document.getElementById("previewSizeDisplay");
    var fontPicker = document.getElementById("fontPickerPopup");
    var fontPickerList = document.getElementById("fontPickerList");
    var btnAddFont = document.getElementById("btnAddFont");
    var btnFontClose = document.getElementById("btnFontPickerClose");

    function loadFontsFromStorage() {
        try { var saved = localStorage.getItem("typoCoreQuickFonts"); if (saved) customFonts = JSON.parse(saved); } catch(e) {}
        if (!Array.isArray(customFonts)) customFonts = [];
        if (customFonts.length > maxFonts) customFonts = customFonts.slice(0, maxFonts);
        var idx = localStorage.getItem("typoCoreQuickFontIndex");
        if (idx !== null) selectedFontIndex = parseInt(idx, 10);
        if (selectedFontIndex >= customFonts.length) selectedFontIndex = -1;
        var savedSize = localStorage.getItem("typoCoreQuickFontSize");
        if (savedSize) previewSize = parseInt(savedSize, 10) || 14;
        if (previewSize < 1) previewSize = 1;
        updateSizeUI();
    }
    function saveFontsToStorage() {
        localStorage.setItem("typoCoreQuickFonts", JSON.stringify(customFonts));
        localStorage.setItem("typoCoreQuickFontIndex", selectedFontIndex);
        localStorage.setItem("typoCoreQuickFontSize", previewSize);
    }
    function updateSizeUI() { if (sizeDisplay) sizeDisplay.textContent = previewSize; saveFontsToStorage(); applyFontAndSizeToPreview(); }
    function applyFontAndSizeToPreview() {
        if (!grid) return;
        var items = grid.querySelectorAll(".preview-item");
        var font = (selectedFontIndex >= 0 && customFonts[selectedFontIndex]) ? customFonts[selectedFontIndex] : "";
        items.forEach(function(item) { item.style.fontSize = previewSize + "px"; item.style.fontFamily = font ? '"' + font + '"' : ""; });
    }
    function renderFontList() {
        if (!fontPickerList) return;
        fontPickerList.innerHTML = "";
        if (customFonts.length === 0) { fontPickerList.innerHTML = '<div style="padding:10px;color:#888;">No fonts. Click "Add".</div>'; return; }
        customFonts.forEach(function(f, index) {
            var div = document.createElement("div");
            div.className = "font-item" + (index === selectedFontIndex ? " selected" : "");
            var indexSpan = document.createElement("span"); indexSpan.className = "font-index"; indexSpan.textContent = (index + 1);
            indexSpan.addEventListener("click", function(e) { e.stopPropagation(); selectFont(index); });
            div.appendChild(indexSpan);
            var nameSpan = document.createElement("span"); nameSpan.className = "font-name"; nameSpan.textContent = f;
            nameSpan.addEventListener("click", function(e) {
                e.stopPropagation();
                if (nameSpan.querySelector("input")) return;
                var oldName = customFonts[index];
                var input = document.createElement("input"); input.type = "text"; input.value = oldName; input.style.width = "100%";
                nameSpan.innerHTML = ""; nameSpan.appendChild(input); input.focus(); input.select();
                function finishEdit() {
                    var newName = input.value.trim();
                    if (newName && newName !== oldName) {
                        if (customFonts.includes(newName)) { alert("Font name already exists."); input.value = oldName; }
                        else { customFonts[index] = newName; saveFontsToStorage(); }
                    }
                    renderFontList();
                    if (selectedFontIndex >= customFonts.length) selectedFontIndex = -1;
                    saveFontsToStorage(); applyFontAndSizeToPreview();
                }
                input.addEventListener("blur", finishEdit);
                input.addEventListener("keydown", function(e) { if (e.key === "Enter") input.blur(); e.stopPropagation(); });
            });
            div.appendChild(nameSpan);
            var removeSpan = document.createElement("span"); removeSpan.className = "font-remove"; removeSpan.textContent = "✕";
            removeSpan.addEventListener("click", function(e) { e.stopPropagation(); removeFont(index); });
            div.appendChild(removeSpan);
            fontPickerList.appendChild(div);
        });
    }
    function selectFont(index) { selectedFontIndex = index; saveFontsToStorage(); renderFontList(); applyFontAndSizeToPreview(); if (fontPicker) fontPicker.style.display = "none"; }
    function removeFont(index) { customFonts.splice(index,1); if(selectedFontIndex === index) selectedFontIndex = -1; else if(selectedFontIndex > index) selectedFontIndex--; saveFontsToStorage(); renderFontList(); applyFontAndSizeToPreview(); }
    function addFont() {
        if (customFonts.length >= maxFonts) { alert("Maximum " + maxFonts + " fonts allowed."); return; }
        var inputField = document.getElementById("newFontName");
        var fontName = inputField ? inputField.value.trim() : "";
        if (!fontName) { alert("Please enter a font name."); return; }
        if (customFonts.includes(fontName)) { alert("Font already in the list."); return; }
        customFonts.push(fontName); saveFontsToStorage(); renderFontList(); selectFont(customFonts.length - 1);
        if (inputField) inputField.value = "";
    }
    if (btnFont) btnFont.addEventListener("click", function() { renderFontList(); if (fontPicker) fontPicker.style.display = "flex"; cs.evalScript('getTextFont()', function(layerFont) { var input = document.getElementById("newFontName"); if (input && layerFont && layerFont !== "ERROR" && layerFont !== "NO_LAYER") input.value = layerFont; }); });
    if (btnFontClose) btnFontClose.addEventListener("click", function() { if (fontPicker) fontPicker.style.display = "none"; });
    if (btnAddFont) btnAddFont.addEventListener("click", addFont);
    if (btnSizeDown) btnSizeDown.addEventListener("click", function() { if (previewSize > 1) previewSize--; updateSizeUI(); });
    if (btnSizeUp) btnSizeUp.addEventListener("click", function() { if (previewSize < 999) previewSize++; updateSizeUI(); });
    loadFontsFromStorage();

    function renderPreviews(text) {
        if (!grid) return;
        grid.innerHTML = "";
        for (var n = 1; n <= 9; n++) {
            var formatted = getCasePreview(text, n);
            var item = document.createElement("div"); item.className = "preview-item";
            if (selectedFontIndex >= 0 && customFonts[selectedFontIndex]) item.style.fontFamily = '"' + customFonts[selectedFontIndex] + '"';
            item.style.fontSize = previewSize + "px"; item.innerHTML = formatted.replace(/\n/g, "<br>");
            item.addEventListener("click", (function(caseNum){ return function(){ _exec('applyCase(' + caseNum + ')'); }; })(n));
            grid.appendChild(item);
        }
    }
    function updatePreviewIfNeeded() {
        cs.evalScript('getText()', function(text) {
            if (!text || text.indexOf("ERROR") >= 0) return;
            if (text === lastPreviewText) return;
            lastPreviewText = text;
            if (!text.trim()) { if (grid) grid.innerHTML = ""; return; }
            renderPreviews(text);
        });
    }
    window.updatePreviewIfNeeded = updatePreviewIfNeeded;
    function loadPreviews() {
        cs.evalScript('getText()', function(text) {
            if (!text || text.indexOf("ERROR") >= 0) { alert("Không tìm thấy text layer!"); return; }
            if (!text.trim()) { alert("Text layer rỗng."); return; }
            lastPreviewText = text; renderPreviews(text);
        });
    }
    if (btnToggle) btnToggle.addEventListener("click", function() { isHorizontal = !isHorizontal; if (isHorizontal) { if (grid) grid.classList.add("horizontal"); btnToggle.textContent = "V"; } else { if (grid) grid.classList.remove("horizontal"); btnToggle.textContent = "H"; } });
    if (btnOpen) btnOpen.addEventListener("click", function() {
        if (overlay && overlay.style.display === "block") {
            closePopup();
            return;
        }
        if (overlay) overlay.style.display = "block";
        loadPreviews();
        if (previewInterval) clearInterval(previewInterval);
        var vis = loadVis();
        if (!vis.manualLoadText) previewInterval = setInterval(updatePreviewIfNeeded, 1000);
    });

    function closePopup() {
        if (overlay) overlay.style.display = "none";
        var popup = document.getElementById('previewPopup');
        if (popup) { var h = popup.offsetHeight; if (h > 0) localStorage.setItem('typoCorePreviewPopupHeight', h); }
        if (previewInterval) { clearInterval(previewInterval); previewInterval = null; }
    }
    if (btnClose) btnClose.addEventListener("click", closePopup);
    if (overlay) overlay.addEventListener("click", function(e) { if (e.target === overlay) closePopup(); });
    if (btnLoad) btnLoad.addEventListener("click", loadPreviews);
    var popupEl = document.getElementById('previewPopup');
    var handleEl = document.querySelector('.resize-handle');
    if (popupEl && handleEl) {
        var savedHeight = localStorage.getItem('typoCorePreviewPopupHeight');
        if (savedHeight && !isNaN(savedHeight)) popupEl.style.height = savedHeight + 'px';
        makeResizable(popupEl, handleEl);
    }

// === Expose hooks cho toolbar mới ===
    window._prvGetPreviewSize = function() { return previewSize; };
    window._prvSetPreviewSize = function(v) {
        previewSize = Math.max(1, Math.min(999, v));
        updateSizeUI();
        var inp = document.getElementById("prvNumInput");
        if (inp && window._prvToolbarMode === 'A') inp.value = previewSize;
    };
    window._prvOpenFontPicker = function() {
        renderFontList();
        if (fontPicker) fontPicker.style.display = "flex";
        cs.evalScript('getTextFont()', function(f) {
            var fi = document.getElementById("newFontName");
            if (fi && f && f !== "ERROR" && f !== "NO_LAYER") fi.value = f;
        });
    };

    if (btnOpen) btnOpen.click();
}
function makeResizable(popupElement, handleElement) {
    let startY, startHeight;
    handleElement.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startY = e.clientY;
        startHeight = parseInt(document.defaultView.getComputedStyle(popupElement).height, 10);
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    });
    function doDrag(e) {
        let newHeight = startHeight + (e.clientY - startY);
        if (newHeight > 150 && newHeight < 1080) {
            popupElement.style.height = newHeight + 'px';
            localStorage.setItem('typoCorePreviewPopupHeight', newHeight);
        }
    }
    function stopDrag() { document.removeEventListener('mousemove', doDrag); document.removeEventListener('mouseup', stopDrag); }
}

// ========== FX MANAGER ==========
var fxCollapsedMode = false;
var fxSwatchTarget = null;
var recentColors = [];



// ========== GÓC GRADIENT: KÉO THẢ XOAY ==========
var angleCanvas = document.getElementById("gradientAngleCanvas");
var angleDragging = false;
var angleCurrent = 0;

function setAngleFromRadians(rad) {
    var deg = rad * 180 / Math.PI;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    angleCurrent = Math.round(deg);
    document.getElementById("gradientAngleInput").value = angleCurrent;
    drawAngleCircle(angleCurrent);
}

function handleAngleDrag(e) {
    if (!angleDragging) return;
    var rect = angleCanvas.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = e.clientX - cx;
    var dy = e.clientY - cy;
    var rad = Math.atan2(-dy, dx);
    setAngleFromRadians(rad);
}

if (angleCanvas) {
    angleCanvas.width = 20;
    angleCanvas.height = 20;
    angleCanvas.addEventListener("mousedown", function(e) {
        e.preventDefault();
        angleDragging = true;
        handleAngleDrag(e); // cập nhật góc tại điểm bấm
        document.addEventListener("mousemove", onAngleMouseMove);
        document.addEventListener("mouseup", onAngleMouseUp);
    });
    function onAngleMouseMove(e) {
        handleAngleDrag(e);
    }
    function onAngleMouseUp() {
        angleDragging = false;
        document.removeEventListener("mousemove", onAngleMouseMove);
        document.removeEventListener("mouseup", onAngleMouseUp);
    }
}
var angleCtx = angleCanvas ? angleCanvas.getContext("2d") : null;

function drawAngleCircle(degrees) {
    if (!angleCanvas || !angleCtx) return;
    var w = angleCanvas.width, h = angleCanvas.height;
    angleCtx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2, radius = 7;
    angleCtx.beginPath();
    angleCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
    angleCtx.strokeStyle = "#aaa";
    angleCtx.lineWidth = 1;
    angleCtx.stroke();
    var rad = degrees * Math.PI / 180;
    var x = cx + radius * Math.cos(rad);
    var y = cy - radius * Math.sin(rad);
    angleCtx.beginPath();
    angleCtx.moveTo(cx, cy);
    angleCtx.lineTo(x, y);
    angleCtx.strokeStyle = "#aaa";
    angleCtx.lineWidth = 1;
    angleCtx.stroke();
}
drawAngleCircle(0);

// Sự kiện nhập số trên ô input góc
on("gradientAngleInput", "input", function(e) {
    var val = parseInt(e.target.value) || 0;
    angleCurrent = val;
    drawAngleCircle(val);
});

// Swatch helpers
function setSwatchColor(el, c) {
    if (!el) return;
    el.style.backgroundColor = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
    el.setAttribute("data-color", JSON.stringify(c));
}
function getSwatchColor(el) {
    if (!el) return { r: 255, g: 255, b: 255 };
    var d = el.getAttribute("data-color");
    try { return d ? JSON.parse(d) : { r:255, g:255, b:255 }; } catch (e) { return { r:255, g:255, b:255 }; }
}

// Color picker & recent colors
function addRecentColor(c) {
    recentColors = recentColors.filter(function(item) { return item.r !== c.r || item.g !== c.g || item.b !== c.b; });
    recentColors.unshift(c);
    if (recentColors.length > 5) recentColors.pop();
    localStorage.setItem("typoCoreRecentColors", JSON.stringify(recentColors));
}


function showColorPicker(targetSwatch, e) {
    fxSwatchTarget = targetSwatch;
    var popup = document.getElementById("colorPickerPopup");
    var fxPopup = document.getElementById("fxPopup");
    if (!popup || !fxPopup) return;
    if (popup.parentNode !== document.body) {
    document.body.appendChild(popup);
}

    // Cập nhật recent colors
    var recentDiv = popup.querySelector(".recent-colors");
    if (recentDiv) {
        recentDiv.innerHTML = "";
        recentColors.forEach(function(c) {
            var sw = document.createElement("div");
            sw.className = "swatch";
            sw.style.backgroundColor = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
            sw.addEventListener("click", (function(color) {
                return function() {
                    setSwatchColor(fxSwatchTarget, color);
                    popup.style.display = "none";
                    addRecentColor(color);
                };
            })(c));
            recentDiv.appendChild(sw);
        });
    }

    // Cập nhật lưới màu cơ bản
    var colorGrid = document.getElementById("colorGrid");
    if (colorGrid) {
        colorGrid.innerHTML = "";
        basicColors.forEach(function(hex) {
            var sw = document.createElement("div");
            sw.style.backgroundColor = hex;
            sw.style.border = "1px solid #666";
            sw.style.borderRadius = "2px";
            sw.style.cursor = "pointer";
            sw.style.width = "14px";
            sw.style.height = "14px";
            sw.addEventListener("click", (function(colorHex) {
                return function() {
                    var r = parseInt(colorHex.slice(1,3), 16);
                    var g = parseInt(colorHex.slice(3,5), 16);
                    var b = parseInt(colorHex.slice(5,7), 16);
                    setSwatchColor(fxSwatchTarget, {r:r, g:g, b:b});
                    popup.style.display = "none";
                    addRecentColor({r:r, g:g, b:b});
                };
            })(hex));
            colorGrid.appendChild(sw);
        });
    }

    // Đo kích thước popup nếu chưa cache
    if (cachedPopupWidth === 0 || cachedPopupHeight === 0) {
        popup.style.display = "flex";
        popup.style.visibility = "hidden";
        cachedPopupWidth = popup.offsetWidth;
        cachedPopupHeight = popup.offsetHeight;
        popup.style.display = "none";
        popup.style.visibility = "visible";
    }

    // Định vị popup
    var top, left;
    if (e) {
        top = e.clientY + 8;
        left = e.clientX - cachedPopupWidth / 2;

        // Giới hạn trong viewport
        if (top + cachedPopupHeight > window.innerHeight) {
            top = e.clientY - cachedPopupHeight - 8;
        }
        if (left < 5) left = 5;
        if (left + cachedPopupWidth > window.innerWidth - 5) {
            left = window.innerWidth - cachedPopupWidth - 5;
        }

        popup.style.position = "fixed";
        popup.style.top = top + "px";
        popup.style.left = left + "px";
        popup.style.bottom = "auto";
        popup.style.right = "auto";
        popup.style.transform = "none";
    } else {
        // Fallback nếu không có sự kiện
        var applyBtn = document.getElementById("btnFxApply");
        if (applyBtn) {
            var rect = applyBtn.getBoundingClientRect();
            top = rect.top - cachedPopupHeight - 5;
            left = rect.left + rect.width / 2 - cachedPopupWidth / 2;
        } else {
            top = window.innerHeight / 2 - cachedPopupHeight / 2;
            left = window.innerWidth / 2 - cachedPopupWidth / 2;
        }
        popup.style.position = "fixed";
        popup.style.top = top + "px";
        popup.style.left = left + "px";
        popup.style.bottom = "auto";
        popup.style.right = "auto";
        popup.style.transform = "none";
    }

    popup.style.display = "flex";

    // Gắn sự kiện đóng toàn cục (chỉ một lần)
    if (!globalColorPickerListenerAdded) {
        document.addEventListener('click', function(e) {
            var popupEl = document.getElementById("colorPickerPopup");
            if (popupEl && popupEl.style.display === "flex") {
                if (popupEl.contains(e.target) ||
                    e.target.closest('.color-swatch') ||
                    e.target.closest('.quick-fgbg')) {
                    return;
                }
                popupEl.style.display = "none";
            }
        });
        globalColorPickerListenerAdded = true;
    }
}

// Gán sự kiện cho color swatches
var swatches = document.querySelectorAll(".color-swatch");
swatches.forEach(function(sw) {
if (sw.id === "textColorSwatch") return;
    sw.addEventListener("click", function(e) {
        showColorPicker(sw, e);
    });
    sw.addEventListener("dblclick", function(e) {
        e.stopPropagation();
        var popup = document.getElementById("colorPickerPopup");
        if (popup) popup.style.display = "none";
        var current = getSwatchColor(sw);
        var jsx = '(function(){' +
            'var c=new SolidColor();' +
            'c.rgb.red=' + current.r + ';c.rgb.green=' + current.g + ';c.rgb.blue=' + current.b + ';' +
            'app.foregroundColor=c;' +
            'var ok=app.showColorPicker();' +
            'if(!ok) return "CANCEL";' +
            'var fg=app.foregroundColor.rgb;' +
            'return JSON.stringify({r:Math.round(fg.red),g:Math.round(fg.green),b:Math.round(fg.blue)});' +
            '})()';
        cs.evalScript(jsx, function(result) {
            if (!result || result === "CANCEL" || result === "null" || result === "undefined") return;
            try {
                var c = JSON.parse(result);
                setSwatchColor(sw, c);
                addRecentColor(c);
            } catch(e) {}
        });
    });
});

// Gán thêm swatch Text Color - chỉ dùng double click để mở color picker Photoshop
(function() {
    var tcSwatch = document.getElementById("textColorSwatch");
    if (!tcSwatch) return;
    // Xóa sự kiện click để tránh trùng lặp với dblclick
    tcSwatch.addEventListener("dblclick", function(e) {
        e.stopPropagation();
        // Đóng popup màu của panel nếu đang mở
        var popup = document.getElementById("colorPickerPopup");
        if (popup) popup.style.display = "none";
        var current = getSwatchColor(tcSwatch);
        var jsx = '(function(){' +
            'var c=new SolidColor();' +
            'c.rgb.red=' + current.r + ';c.rgb.green=' + current.g + ';c.rgb.blue=' + current.b + ';' +
            'app.foregroundColor=c;' +
            'var ok=app.showColorPicker();' +
            'if(!ok) return "CANCEL";' +
            'var fg=app.foregroundColor.rgb;' +
            'return JSON.stringify({r:Math.round(fg.red),g:Math.round(fg.green),b:Math.round(fg.blue)});' +
            '})()';
        cs.evalScript(jsx, function(result) {
            if (!result || result === "CANCEL" || result === "null" || result === "undefined") return;
            try { var c = JSON.parse(result); setSwatchColor(tcSwatch, c); addRecentColor(c); } catch(e) {}
        });
    });
    // Khởi tạo màu mặc định trắng
    setSwatchColor(tcSwatch, {r:255, g:255, b:255});
})();

// Mở/đóng FX overlay
on("btnOpenFX", "click", function() {
    var el = document.getElementById("fxOverlay");
    if (!el) return;
    var isOpen = el.style.display === "flex";
    el.style.display = isOpen ? "none" : "flex";
    localStorage.setItem("typoCoreFxState", isOpen ? "closed" : "open");
});
on("btnFxClose", "click", function() {
    var el = document.getElementById("fxOverlay");
    if (el) {
        el.style.display = "none";
        localStorage.setItem("typoCoreFxState", "closed");
    }
});

// More / Less toggle — collapse/expand tất cả fx-section-body
on("btnFxToggleMode", "click", function() {
    fxCollapsedMode = !fxCollapsedMode;
    this.textContent = fxCollapsedMode ? 'More' : 'Less';
    localStorage.setItem("typoCoreFxCollapsed", fxCollapsedMode ? "1" : "0");
    document.querySelectorAll('.fx-section-body').forEach(function(body) {
        body.style.maxHeight = fxCollapsedMode ? body.scrollHeight + 'px' : '0';
    });
});

// Lấy danh sách ID của các layer đang được chọn
function getSelectedLayersIDs() {
    var ids = [];
    try {
        var ref = new ActionReference();
        ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("targetLayersIDs"));
        ref.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
        var desc = executeActionGet(ref);
        var list = desc.getList(stringIDToTypeID("targetLayersIDs"));
        for (var i = 0; i < list.count; i++) ids.push(list.getReference(i).getIdentifier());
    } catch(e) {
        ids.push(app.activeDocument.activeLayer.id);
    }
    return ids;
}

function selectLayerByID(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
}

// Đếm số lượng text layer đang được chọn
function countSelectedTextLayers() {
    if (!app.documents.length) return 0;
    var ids = getSelectedLayersIDs();
    var count = 0;
    var original = app.activeDocument.activeLayer;
    for (var i = 0; i < ids.length; i++) {
        try {
            selectLayerByID(ids[i]);
            if (app.activeDocument.activeLayer.kind == LayerKind.TEXT) count++;
        } catch(e) {}
    }
    // Khôi phục layer ban đầu
    try { selectLayerByID(original.id); } catch(e) {}
    return count;
}


// Sliders
function bindSlider(sliderId, valId) {
    var slider = document.getElementById(sliderId);
    var input = document.getElementById(valId);
    if (!slider || !input) return;
    slider.addEventListener("input", function() {
        input.value = Math.round(this.value);
    });
    input.addEventListener("input", function() {
        var v = parseFloat(this.value);
        if (isNaN(v)) v = 0;
        v = Math.min(parseFloat(slider.max), Math.max(parseFloat(slider.min), v));
        slider.value = v;
        this.value = v;
    });
    input.value = Math.round(slider.value);
}
bindSlider("strokeSize1", "strokeSize1Val");
bindSlider("glowOpacity", "glowOpacityVal");
bindSlider("glowSize", "glowSizeVal");
bindSlider("glowSpread", "glowSpreadVal");
bindSlider("textColorFill", "textColorFillVal");

// SYNC với debounce
var syncTimeout = null;
on("btnFxSync", "click", function() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(function() {
        var btn = document.getElementById("btnFxSync");
        cs.evalScript("getFXData()", function(json) {
            if (!json || json === "NO_DOC" || json === "NO_FX" || json.indexOf("ERROR:") === 0) {
                alert("Không tìm thấy FX: " + (json || "undefined"));
                if (btn) flash(btn, "NO_FX");
                return;
            }
            try {
                var data = JSON.parse(json);
                // Lưu màu chữ (nếu có) vào swatch Text Color section
                var textColorCheck = document.getElementById("enableTextColor");
                var textColorSwatch = document.getElementById("textColorSwatch");
                if (data.textColor) {
                    syncedTextColor = data.textColor;
                    if (textColorCheck) textColorCheck.checked = true;
                    if (textColorSwatch) setSwatchColor(textColorSwatch, data.textColor);
                } else {
                    syncedTextColor = null;
                    if (textColorCheck) textColorCheck.checked = false;
                }
                if (!data.strokes && data.frameFX) data.strokes = [data.frameFX];

                var gradCheck = document.querySelector('[data-fx="gradientFill"]');
                if (gradCheck) gradCheck.checked = false;
                document.getElementById("gradientAngleInput").value = 0;
                setSwatchColor(document.getElementById("gradientColor1"), {r:255,g:255,b:255});
                setSwatchColor(document.getElementById("gradientColor2"), {r:255,g:255,b:255});

                var frameCheck = document.querySelector('[data-fx="frameFX"]');
                if (frameCheck) frameCheck.checked = false;
                document.getElementById("strokeSize1").value = 1;
                document.getElementById("strokeSize1Val").value = 1;
                setSwatchColor(document.getElementById("strokeColor1"), {r:255,g:255,b:255});

                var glowCheck = document.querySelector('[data-fx="outerGlow"]');
                if (glowCheck) glowCheck.checked = false;
                document.getElementById("glowOpacity").value = 35; document.getElementById("glowOpacityVal").value = 35;
                document.getElementById("glowSize").value = 62; document.getElementById("glowSizeVal").value = 62;
                document.getElementById("glowSpread").value = 16; document.getElementById("glowSpreadVal").value = 16;
                setSwatchColor(document.getElementById("glowColor"), {r:255,g:255,b:255});

                if (data.gradientFill) {
                    if (gradCheck) gradCheck.checked = data.gradientFill.enabled;
                    document.getElementById("gradientAngleInput").value = data.gradientFill.angle || 0;
                    if (data.gradientFill.colors && data.gradientFill.colors.length > 0) {
                        setSwatchColor(document.getElementById("gradientColor1"), data.gradientFill.colors[0]);
                        if (data.gradientFill.colors.length > 1) setSwatchColor(document.getElementById("gradientColor2"), data.gradientFill.colors[1]);
                    }
                    drawAngleCircle(data.gradientFill.angle || 0);
                }

                if (data.strokes && data.strokes.length > 0) {
                    if (frameCheck) frameCheck.checked = true;
                    var s1 = data.strokes[0];
                    document.getElementById("strokeSize1").value = s1.size;
                    document.getElementById("strokeSize1Val").value = Math.round(s1.size);
                    setSwatchColor(document.getElementById("strokeColor1"), s1.color);
                }

                if (data.outerGlow) {
                    if (glowCheck) glowCheck.checked = data.outerGlow.enabled;
                    document.getElementById("glowOpacity").value = data.outerGlow.opacity; document.getElementById("glowOpacityVal").value = Math.round(data.outerGlow.opacity);
                    document.getElementById("glowSize").value = data.outerGlow.blur; document.getElementById("glowSizeVal").value = Math.round(data.outerGlow.blur);
                    document.getElementById("glowSpread").value = data.outerGlow.chokeMatte; document.getElementById("glowSpreadVal").value = Math.round(data.outerGlow.chokeMatte);
                    setSwatchColor(document.getElementById("glowColor"), data.outerGlow.color);
                }

                if (btn) flash(btn, "OK");
            } catch(e) { alert("Lỗi parse JSON: " + e.message); if (btn) flash(btn, "ERROR"); }
        });
    }, 200);
});

// Nút Apply (ghi đè) – hỗ trợ multi-layer, luôn hiển thị spinner
on("btnFxApply", "click", function() {
    var btn = this;
    var payload = {};

    var gradCheck = document.querySelector('[data-fx="gradientFill"]');
    if (gradCheck && gradCheck.checked) {
        payload.gradientFill = {
            enabled: true,
            angle: parseFloat(document.getElementById("gradientAngleInput").value) || 0,
            type: "linear",
            colors: [getSwatchColor(document.getElementById("gradientColor1")), getSwatchColor(document.getElementById("gradientColor2"))]
        };
    }

    var strokes = [];
    var frameCheck = document.querySelector('[data-fx="frameFX"]');
    if (frameCheck && frameCheck.checked) {
        strokes.push({
            enabled: true,
            size: parseFloat(document.getElementById("strokeSize1").value) || 1,
            color: getSwatchColor(document.getElementById("strokeColor1"))
        });
    }
    if (strokes.length > 0) payload.strokes = strokes;

    var glowCheck = document.querySelector('[data-fx="outerGlow"]');
    if (glowCheck && glowCheck.checked) {
        payload.outerGlow = {
            enabled: true,
            opacity: parseFloat(document.getElementById("glowOpacity").value) || 100,
            blur: parseFloat(document.getElementById("glowSize").value) || 10,
            chokeMatte: parseFloat(document.getElementById("glowSpread").value) || 15,
            color: getSwatchColor(document.getElementById("glowColor"))
        };
    }
    
    // Text Color: đọc từ swatch nếu checkbox được bật
    var textColorCheck = document.getElementById("enableTextColor");
    if (textColorCheck && textColorCheck.checked) {
        var tcSwatch = document.getElementById("textColorSwatch");
        var tc = getSwatchColor(tcSwatch);
        var fillVal = parseFloat(document.getElementById("textColorFill").value);
        // fillVal 0-100 → opacity của màu (trộn với trắng)
        var ratio = fillVal / 100;
        payload.textColor = {
            r: Math.round(tc.r * ratio + 255 * (1 - ratio)),
            g: Math.round(tc.g * ratio + 255 * (1 - ratio)),
            b: Math.round(tc.b * ratio + 255 * (1 - ratio))
        };
    }

    var jsonStr = JSON.stringify(payload);
    var spinner = document.getElementById("fxSpinner");
    
    // Luôn hiển thị spinner khi bắt đầu apply (dù 1 layer hay nhiều layer)
    if (spinner) spinner.style.display = "inline-block";
    
    // Gọi apply lên tất cả layer được chọn
    var expr = 'applyFXToSelectedLayers(' + JSON.stringify(jsonStr) + ')';
    _exec(expr, btn, function(res) {
        if (spinner) spinner.style.display = "none";
        if (res !== "OK") alert("Apply thất bại: " + res);
    });
});

// Nút FG và BG trong color picker popup (dùng cho tất cả swatch)
function applyPSColorToSwatch(type) {
    if (!fxSwatchTarget) { 
        alert("Chọn ô màu trước"); 
        return; 
    }
    var jsx = type === "FG"
        ? '(function(){var c=app.foregroundColor.rgb;return JSON.stringify({r:Math.round(c.red),g:Math.round(c.green),b:Math.round(c.blue)});})()'
        : '(function(){var c=app.backgroundColor.rgb;return JSON.stringify({r:Math.round(c.red),g:Math.round(c.green),b:Math.round(c.blue)});})()'
    cs.evalScript(jsx, function(col) {
        if (!col || col === "null" || col === "undefined") return;
        try {
            var c = JSON.parse(col);
            setSwatchColor(fxSwatchTarget, c);
            var popup = document.getElementById("colorPickerPopup");
            if (popup) popup.style.display = "none";
            addRecentColor(c);
        } catch(e) {}
    });
}
var fgBtn = document.querySelector("#colorPickerPopup .fg-color");
if (fgBtn) fgBtn.addEventListener("click", function() { applyPSColorToSwatch("FG"); });
var bgBtn = document.querySelector("#colorPickerPopup .bg-color");
if (bgBtn) bgBtn.addEventListener("click", function() { applyPSColorToSwatch("BG"); });

// Nút FG/BG duy nhất dành riêng cho gradient (lấy FG cho color1, BG cho color2)
var quickFgBg = document.querySelector('.quick-fgbg');
if (quickFgBg) {
    quickFgBg.addEventListener('click', function(e) {
        e.stopPropagation();
        var swatch1 = document.getElementById('gradientColor1');
        var swatch2 = document.getElementById('gradientColor2');
        if (!swatch1 || !swatch2) return;
        cs.evalScript(
            '(function(){var fg=app.foregroundColor.rgb,bg=app.backgroundColor.rgb;return JSON.stringify({fg:{r:Math.round(fg.red),g:Math.round(fg.green),b:Math.round(fg.blue)},bg:{r:Math.round(bg.red),g:Math.round(bg.green),b:Math.round(bg.blue)}});})()',
            function(res) {
                if (!res || res === "null" || res === "undefined") return;
                try {
                    var d = JSON.parse(res);
                    setSwatchColor(swatch1, d.fg);
                    setSwatchColor(swatch2, d.bg);
                    addRecentColor(d.fg);
                    addRecentColor(d.bg);
                } catch(e) {}
            }
        );
        var popup = document.getElementById('colorPickerPopup');
        if (popup) popup.style.display = 'none';
    });
}
drawAngleCircle(0);



// ========== PRV NEW TOOLBAR ==========
window._prvToolbarMode = 'A'; // 'A' = preview font/size | 'B' = layer center/size+leading

(function initPrvToolbar() {
    var btnLeft   = document.getElementById("btnPrvLeft");
    var btnMinus  = document.getElementById("btnPrvMinus");
    var btnPlus   = document.getElementById("btnPrvPlus");
    var btnSpinUp = document.getElementById("btnPrvSpinUp");
    var btnSpinDn = document.getElementById("btnPrvSpinDn");
    var numInput  = document.getElementById("prvNumInput");
    var btnMode   = document.getElementById("btnPreviewMode");
    var _prvStep  = 3;

    if (!numInput) return;

    function getNum() { return parseInt(numInput.value) || 1; }
    function setNum(v) { numInput.value = Math.max(1, Math.min(999, v)); }

function switchMode(mode) {
    window._prvToolbarMode = mode;
    localStorage.setItem("typoCorePrvMode", mode); // thêm dòng này
    if (mode === 'A') {
        if (btnLeft) btnLeft.textContent = 'Font';
        var sz = window._prvGetPreviewSize ? window._prvGetPreviewSize() : 14;
        setNum(sz);
        // Ẩn spin
        if (btnSpinUp) btnSpinUp.style.display = 'none';
        if (btnSpinDn) btnSpinDn.style.display = 'none';
    } else {
        if (btnLeft) btnLeft.textContent = 'Center';
        setNum(_prvStep);
        // Hiện spin
        if (btnSpinUp) btnSpinUp.style.display = '';
        if (btnSpinDn) btnSpinDn.style.display = '';
    }
    // Gán data-mode một lần, tránh null
    var sc = document.getElementById("sizeControl");
    if (sc) sc.setAttribute("data-mode", mode === 'A' ? "font" : "center");
}

    // Nút Mode (⊞): hoán đổi A ↔ B
    if (btnMode) btnMode.addEventListener("click", function() {
        switchMode(window._prvToolbarMode === 'A' ? 'B' : 'A');
    });

    // Nút trái: Font (A) hoặc Center (B)
    if (btnLeft) btnLeft.addEventListener("click", function() {
        if (window._prvToolbarMode === 'A') {
            if (window._prvOpenFontPicker) window._prvOpenFontPicker();
        } else {
            _exec('alignCenter()', this);
        }
    });

    // ▲ bên trong ô — tăng số 1
    if (btnSpinUp) btnSpinUp.addEventListener("click", function(e) {
        e.stopPropagation();
        var v = getNum() + 1;
        setNum(v);
        if (window._prvToolbarMode === 'A') {
            if (window._prvSetPreviewSize) window._prvSetPreviewSize(v);
        } else {
            _prvStep = getNum();
        }
    });

    // ▼ bên trong ô — giảm số 1
    if (btnSpinDn) btnSpinDn.addEventListener("click", function(e) {
        e.stopPropagation();
        var v = Math.max(1, getNum() - 1);
        setNum(v);
        if (window._prvToolbarMode === 'A') {
            if (window._prvSetPreviewSize) window._prvSetPreviewSize(v);
        } else {
            _prvStep = getNum();
        }
    });

    // Nhập tay vào ô số
if (numInput) numInput.addEventListener("change", function() {
        var v = Math.max(1, parseInt(this.value) || 1);
        setNum(v);
        if (window._prvToolbarMode === 'A') {
            if (window._prvSetPreviewSize) window._prvSetPreviewSize(v);
        } else {
            _prvStep = v;
            localStorage.setItem("typoCorePrvStep", v);
        }
    });

    // Nút − bên ngoài
    if (btnMinus) btnMinus.addEventListener("click", function() {
        if (window._prvToolbarMode === 'A') {
            var sz = window._prvGetPreviewSize ? window._prvGetPreviewSize() : getNum();
            if (window._prvSetPreviewSize) window._prvSetPreviewSize(sz - 1);
            setNum(window._prvGetPreviewSize ? window._prvGetPreviewSize() : sz - 1);
        } else {
            _exec('applyNow(' + (-_prvStep) + ',' + (-_prvStep) + ')', this);
        }
    });

    // Nút + bên ngoài
    if (btnPlus) btnPlus.addEventListener("click", function() {
        if (window._prvToolbarMode === 'A') {
            var sz = window._prvGetPreviewSize ? window._prvGetPreviewSize() : getNum();
            if (window._prvSetPreviewSize) window._prvSetPreviewSize(sz + 1);
            setNum(window._prvGetPreviewSize ? window._prvGetPreviewSize() : sz + 1);
        } else {
            _exec('applyNow(' + _prvStep + ',' + _prvStep + ')', this);
        }
    });

// Khôi phục mode và step đã lưu
    var savedPrvMode = localStorage.getItem("typoCorePrvMode") || 'A';
    var savedPrvStep = parseInt(localStorage.getItem("typoCorePrvStep")) || 3;
    _prvStep = savedPrvStep;
    switchMode(savedPrvMode);
})();

// ========== KHỞI ĐỘNG ==========
(function init() {
    restoreLayout();
    var vis = loadVis(); applyVis(vis);
    var savedLogo = localStorage.getItem("typoCoreLogoPath");
    if (savedLogo) {
        cs.evalScript('LOGO_PATH = "' + savedLogo.replace(/"/g, '\\"') + '"');
        var btnLogo = document.getElementById("btnLogo"); if (btnLogo) btnLogo.title = savedLogo;
        var actionsSection = document.getElementById('section-actions');
        if (actionsSection) {
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === "style" && fxOverlay.style.display === "flex") {
            var saved = localStorage.getItem("typoCoreFxScrollHeight");
            if (saved) scrollDiv.style.height = saved + "px";
            // Khôi phục More/Less
            var savedCollapsed = localStorage.getItem("typoCoreFxCollapsed");
            fxCollapsedMode = savedCollapsed === "1";
            var toggleBtn = document.getElementById("btnFxToggleMode");
            if (toggleBtn) toggleBtn.textContent = fxCollapsedMode ? 'More' : 'Less';
            document.querySelectorAll('.fx-section-body').forEach(function(body) {
                body.style.maxHeight = fxCollapsedMode ? body.scrollHeight + 'px' : '0';
            });
        }
    });
});
            observer.observe(actionsSection, { attributes: true, attributeFilter: ['style'] });
            var isVisible = window.getComputedStyle(actionsSection).display !== 'none';
            if (!isVisible) document.body.classList.add('actions-hidden');
            else document.body.classList.remove('actions-hidden');
        }
    }
    setupSettingPopup();
    on("addRowBtn", "click", addNewRow);
    on("saveLayoutBtn", "click", saveAndExitEditMode);
    var actionGrid = document.querySelector('.action-grid');
    if (actionGrid) {
        actionGrid.addEventListener('click', function(e) {
            if (!_editMode) return;
            let row = e.target.closest('.action-row');
            if (row && row.querySelectorAll('[data-tool]').length === 0) {
                row.remove(); saveLayout();
                if (_editMode) { initButtonSortable(); enableAllButtonSortable(true); }
            }
        });
    }
    setupPreviewPopup();

// Sync prvNumInput với preview size đã load (chỉ khi đang ở mode A)
    if (window._prvToolbarMode === 'A' && window._prvGetPreviewSize) {
        var ni = document.getElementById("prvNumInput");
        if (ni) ni.value = window._prvGetPreviewSize();
    }
// Khôi phục trạng thái đóng/mở FX Manager
var savedFxState = localStorage.getItem("typoCoreFxState");
if (savedFxState === "open") {
    var fxOverlay = document.getElementById("fxOverlay");
    if (fxOverlay) fxOverlay.style.display = "flex";
}
    makeFxResizable();
    console.log("[TypoCore] Ready");
})();

// Resize FX Manager (giống quick layout)
function makeFxResizable() {
    var scrollDiv = document.querySelector('.fx-scroll');
    var handle = document.querySelector('.fx-resize-handle');
    if (!scrollDiv || !handle) return;

    // Khôi phục chiều cao vùng cuộn đã lưu
    var savedHeight = localStorage.getItem("typoCoreFxScrollHeight");
    if (savedHeight) {
        scrollDiv.style.height = savedHeight + "px";
    }

    var startY, startHeight;

    handle.addEventListener("mousedown", function(e) {
        e.preventDefault();
        startY = e.clientY;
        startHeight = scrollDiv.offsetHeight;   // chiều cao thực tế hiện tại
        document.addEventListener("mousemove", doDrag);
        document.addEventListener("mouseup", stopDrag);
    });

function doDrag(e) {
    var newHeight = startHeight + (e.clientY - startY);
    newHeight = Math.max(110, Math.min(600, newHeight));
    scrollDiv.style.height = newHeight + "px";
    localStorage.setItem("typoCoreFxScrollHeight", newHeight);
}
    function stopDrag() {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
    }

    // Khi mở lại FX overlay, phục hồi chiều cao vùng cuộn
    var fxOverlay = document.getElementById("fxOverlay");
    if (fxOverlay) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === "style" && fxOverlay.style.display === "flex") {
                    var saved = localStorage.getItem("typoCoreFxScrollHeight");
                    if (saved) scrollDiv.style.height = saved + "px";
                }
            });
        });
        observer.observe(fxOverlay, { attributes: true });
    }
}


// Gọi khởi tạo listener khi panel load
// Nếu file đã có một IIFE (hàm tự thực thi), hãy thêm dòng bên trong nó.
// Ví dụ: (function init() { ... startHotkeyListener(); ... })();
startHotkeyListener();


// Gọi khi panel khởi tạo
startHotkeyListener();

function applyCase(n) { _exec('applyCase(' + n + ')'); }
function splitEven(n) { _exec('splitEven(' + n + ')'); }

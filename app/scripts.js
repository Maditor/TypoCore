var cs     = new CSInterface();
  var _busy = false;
  var _queue        = [];
  var MAX_QUEUE    = 2;
  var _currentExpr = '';
  var previewInterval = null;

  var _patternData = {
      1:{4:[2,2],6:[2,2,2],7:[2,3,2],8:[2,4,2],10:[2,3,3,2],11:[2,3,3,3],13:[2,4,4,3],14:[3,4,4,3],15:[4,4,4,3],17:[2,4,5,4,2],20:[3,5,5,4,3],24:[3,4,5,5,4,3],30:[4,5,7,6,5,3]},
    2:{4:[2,2],6:[3,3],7:[4,3],8:[2,3,3],10:[3,4,3],11:[4,4,3],13:[3,6,4],14:[2,4,4,3],15:[5,6,5],17:[3,5,6,3],20:[4,5,6,5],24:[4,6,6,5,3],30:[4,7,8,7,4]},
    3:{4:[1,2,1],6:[1,2,3],7:[1,2,3,1],8:[1,2,3,2],10:[1,2,4,3],11:[1,2,3,3,2],13:[2,4,4,3],14:[2,5,4,3],15:[2,4,5,4],17:[2,4,5,4,2],20:[2,4,6,4,4],24:[2,4,6,5,4,3],30:[2,5,7,6,6,4]},
    4:{4:[2,2],6:[2,4],7:[2,2,3],8:[2,3,3],10:[2,4,4],11:[2,4,3,2],13:[3,6,4],14:[3,7,4],15:[2,5,6,2],17:[2,5,6,4],20:[3,7,6,4],24:[3,7,6,5,3],30:[3,7,7,7,6]},
    5:{4:[1,2,1],6:[3,2,1],7:[1,2,2,2],8:[2,3,2,1],10:[1,4,3,2],11:[2,3,4,2],13:[3,4,4,2],14:[3,4,4,2,1],15:[2,3,4,4,2],17:[3,4,4,4,2],20:[3,5,5,5,2],24:[3,4,5,5,5,2],30:[4,5,6,6,6,3]},
    6:{4:[2,2],6:[4,2],7:[2,2,2,1],8:[3,3,2],10:[4,4,2],11:[4,5,2],13:[4,6,3],14:[5,6,3],15:[5,6,4],17:[4,6,4,3],20:[5,6,6,3],24:[6,7,7,4],30:[6,7,7,7,3]},
    7:{4:[2,2],6:[2,2,2],7:[3,4],8:[2,4,2],10:[2,3,3,2],11:[2,3,3,3],12:[2,4,3,3],13:[3,3,4,3],14:[2,4,5,3],15:[2,5,4,4],16:[2,3,4,4,3],17:[2,4,5,4,2],20:[2,5,5,5,3],23:[3,4,6,4,4,2],24:[2,3,5,6,5,3],30:[2,6,7,6,6,3]},
    8:{4:[2,2],6:[3,2,2],7:[3,3,1],8:[3,3,2],10:[3,3,2,2],11:[3,5,3],12:[2,4,4,2],13:[3,5,3,2],14:[3,5,4,2],15:[3,5,5,2],17:[3,3,5,4,2],20:[3,5,6,4,2],21:[3,5,5,5,3],24:[3,5,6,5,3,2],30:[3,6,8,7,4,2]},
    9:{4:[2,2],5:[2,2,1],6:[2,3,1],7:[3,4],8:[3,2,3],10:[4,3,3],11:[4,3,4],13:[4,4,3,2],14:[4,4,3,3],15:[3,4,5,3],17:[4,5,4,4],19:[3,4,5,4,3],20:[4,5,5,4,2],24:[4,5,6,5,4],30:[4,5,6,6,6,4]}
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
          if (len % 2 == 1) {
              pattern[Math.floor(len/2)] += extra;
          } else {
              var m1 = Math.floor(len/2)-1, m2 = Math.floor(len/2);
              pattern[m1] += Math.floor(extra/2);
              pattern[m2] += extra - Math.floor(extra/2);
          }
      }
      var lines = [], idx = 0;
      for (var i = 0; i < pattern.length; i++) {
          var lineWords = [];
          for (var j = 0; j < pattern[i]; j++) {
              if (words[idx]) lineWords.push(words[idx++]);
          }
          lines.push(lineWords.join(" "));
      }
      return lines.join("\n");
  }

  (function() {
    try {
      var raw     = cs.getSystemPath(SystemPath.EXTENSION);
      var extPath = raw.split("\\").join("/");
      var jsxPath = extPath + "/app/host.jsx";
      cs.evalScript(
        'if (typeof _typoCoreLoaded === "undefined") { $.evalFile(new File("' + jsxPath + '")); _typoCoreLoaded = true; "LOADED"; } else { "CACHED"; }',
        function(res) { console.log("[TypoCore] JSX:", res); }
      );
    } catch(e) { console.error(e); }
  })();

  function _isNoQueueTask(expr) {
      return expr.startsWith('applyCase') || expr.startsWith('splitEven');
  }

  function _executeNow(expr, btn, onDone) {
      if (_busy) return;
      _busy = true;
      _currentExpr = expr;
      cs.evalScript(expr, function(result) {
          _busy = false;
          _currentExpr = '';
          console.log("[Exec]", expr, "=>", result);
          if (btn) {
              flash(btn, result);
              btn.blur();
          }
          if (onDone) onDone(result);
          _processQueue();
      });
  }

  function _processQueue() {
      if (_busy) return;
      if (_queue.length === 0) return;
      var task = _queue.shift();
      _executeNow(task.expr, task.btn, task.onDone);
  }

  function _exec(expr, btn, onDone) {
      if (!_busy) {
          _executeNow(expr, btn, onDone);
          return;
      }
      if (_isNoQueueTask(expr)) {
          console.log("[Queue] Bỏ qua (no-queue):", expr);
          return;
      }
      if (_queue.length >= MAX_QUEUE) {
          console.log("[Queue] Đầy, bỏ qua:", expr);
          return;
      }
      if (_currentExpr === expr) {
          console.log("[Queue] Trùng với tác vụ đang chạy:", expr);
          return;
      }
      for (var i = 0; i < _queue.length; i++) {
          if (_queue[i].expr === expr) {
              console.log("[Queue] Trùng lặp, bỏ qua:", expr);
              return;
          }
      }
      _queue.push({ expr: expr, btn: btn, onDone: onDone });
      console.log("[Queue] Thêm vào:", expr, "- Số lượng:", _queue.length);
  }

  function runBtn(expr, el) { _exec(expr, el); }

  var BAD = {
    "ERROR":1, "NO_LAYER":1, "NO_FX":1,
    "NO_PATH":1, "NO_FILE":1, "NO_DOC":1, "NO_TEXT":1, "NO_OTHER_DOC":1
  };
  function flash(btn, result) {
      if (!btn) return;
      var bad = !result || BAD[result] || (result+"").includes("ERROR");
      btn.classList.remove("flash-ok", "flash-err");
      btn.classList.add(bad ? "flash-err" : "flash-ok");
      setTimeout(function() {
          btn.classList.remove("flash-ok", "flash-err");
          btn.blur();
      }, 500);
  }

  var _step = 3;
  var sizeInput = document.getElementById("sizeDisplay");
  var isEditing = false;

  function updateStepUI() {
      if (!isEditing) sizeInput.value = _step;
  }

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

  sizeInput.addEventListener("click", function(e) {
      if (isEditing) return;
      isEditing = true;
      sizeInput.readOnly = false;
      sizeInput.focus();
      sizeInput.select();
      sizeInput.style.backgroundColor = "#2a2a2a";
  });

  sizeInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
          e.preventDefault();
          applyStepInput();
          sizeInput.blur();
      }
  });

  sizeInput.addEventListener("focusout", function(e) {
      setTimeout(function() {
          if (isEditing && document.activeElement !== sizeInput) applyStepInput();
      }, 10);
  });

  function changeStep(delta) {
      if (isEditing) return;
      _step = Math.min(50, Math.max(1, _step + delta));
      updateStepUI();
  }

  function applySize(sign) {
      if (isEditing) return;
      var d = _step * sign;
      var btn = document.getElementById(sign > 0 ? "btnPlus" : "btnMinus");
      _exec('applyNow(' + d + ',' + d + ')', btn);
  }
  updateStepUI();

  function doCopyFX() {
    var btn = document.getElementById("btnCopyFX");
    _exec('copyFX()', btn, function(res) {
      if (res === "OK") document.getElementById("btnPasteFX").disabled = false;
    });
  }

  function doPasteFX() {
    var btn = document.getElementById("btnPasteFX");
    _exec('pasteFX()', btn, function(res) {
        if (res === "OK") {
            var vis = loadVis();
            if (!vis.multiplePaste) btn.disabled = true;
        }
    });
  }

  // ========== TOOL VISIBILITY ==========
  var STORAGE_KEY = "typoCoreToolVisibility";
  var TOOL_DEFS = {
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
      if (raw) {
        var data = JSON.parse(raw);
        if (typeof data.multiplePaste === "undefined") data.multiplePaste = false;
        return data;
      }
    } catch(e) {}
    var vis = {};
    for (var k in TOOL_DEFS) vis[k] = true;
    vis.multiplePaste = false;
    return vis;
  }

  function saveVis(vis) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vis)); } catch(e) {}
  }

  function applyVis(vis) {
  for (var key in TOOL_DEFS) {
    var def = TOOL_DEFS[key];
    var show = vis[key] !== false;
	var actionsSection = document.getElementById("section-actions");
if (actionsSection) {
    var isActionsVisible = window.getComputedStyle(actionsSection).display !== "none";
    if (!isActionsVisible) {
        document.body.classList.add("actions-hidden");
    } else {
        document.body.classList.remove("actions-hidden");
    }
}
    if (def.isSection) {
      var el = document.getElementById(def.sectionId);
      if (el) el.style.display = show ? "" : "none";
    } else {
      var btn = document.querySelector('[data-tool="' + def.dataTool + '"]');
      if (btn) btn.style.display = show ? "" : "none";
    }
  }
  requestAnimationFrame(function() {
    cs.resizeContent(document.body.scrollWidth, document.body.scrollHeight);
  });
  updateCheckboxes(vis);
  }

  function updateCheckboxes(vis) {
    for (var key in TOOL_DEFS) {
      var cb = document.getElementById("toggle_" + key);
      if (cb) cb.checked = vis[key] !== false;
    }
  }

// ========== DRAG & DROP LAYOUT ==========
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
            sortableSections = new Sortable(document.querySelector('.panel'), {
                animation: 150,
                handle: '.section',
                draggable: '.section',
                disabled: false,
                onEnd: saveLayout
            });
        } else {
            sortableSections.enable();
        }
        initButtonSortable();
        enableAllButtonSortable(true);

   } else {
        // Tắt drag section — destroy hẳn để chắc chắn không còn drag
        if (sortableSections) {
            sortableSections.destroy();
            sortableSections = null;  // reset để lần sau tạo lại
        }

        // Tắt drag buttons — destroy hẳn
        sortableButtons.forEach(function(s) { if (s) s.destroy(); });
        sortableButtons = [];

        // Xoá hàng trống
        document.querySelectorAll('.action-row').forEach(function(row) {
            if (row.querySelectorAll('[data-tool]').length === 0) {
                row.remove();
            }
        });

        saveLayout();
    }


}



// Tạo Sortable cho tất cả action-row, nhưng VÔ HIỆU HÓA (disabled)
function initSortableForAllRows() {
    var rows = document.querySelectorAll('.action-row');
    sortableButtons.forEach(function(s) { if(s) s.destroy(); });
    sortableButtons = [];

    rows.forEach(function(row) {
        var sort = new Sortable(row, {
            group: {
                name: 'actions-group',      // TÊN NHÓM RIÊNG CHO ACTIONS
                pull: true,
                put: ['actions-group']     // CHỈ NHẬN NÚT TỪ CÙNG NHÓM
            },
            animation: 200,
            draggable: '[data-tool]',
            onEnd: function() { saveLayout(); }
        });
        sortableButtons.push(sort);
    });
}
function initButtonSortable() {
    initSortableForAllRows();
}

function addNewRow() {
    var actionGrid = document.querySelector('.action-grid');
    if (!actionGrid) return;
    
    var newRow = document.createElement('div');
    newRow.className = 'action-row';
    newRow.style.display = 'flex';
    actionGrid.appendChild(newRow);
    
    var sort = new Sortable(newRow, {
        group: {
            name: 'actions-group',
            pull: true,
            put: ['actions-group']
        },
        animation: 200,
        draggable: '[data-tool]',
        onEnd: function() {
            saveLayout();
        }
    });
    sortableButtons.push(sort);
    saveLayout();
}


function enableAllButtonSortable(enable) {
    sortableButtons.forEach(function(sort) {
        if (enable) sort.enable();
        else sort.disable();
    });
}



function saveLayout() {
    var sections = [];
    var sectionElements = document.querySelectorAll('.panel > .section');
    for (var i = 0; i < sectionElements.length; i++) {
        var sec = sectionElements[i];
        var id = sec.getAttribute('data-drag-id') || sec.id;
        sections.push(id);
    }
    
    var actionButtons = [];
    var rows = document.querySelectorAll('.action-row');
    for (var r = 0; r < rows.length; r++) {
        var tools = [];
        var btns = rows[r].querySelectorAll('[data-tool]');
        for (var b = 0; b < btns.length; b++) {
            tools.push(btns[b].getAttribute('data-tool'));
        }
        if (tools.length) actionButtons.push(tools);
    }
    
    var layout = { sections: sections, actionButtons: actionButtons };
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); } catch(e) {}
}

function restoreLayout() {
    try {
        var raw = localStorage.getItem(LAYOUT_KEY);
        var panel = document.querySelector('.panel');
        
        // 1. Phục hồi thứ tự các section (luôn làm, kể cả không có layout)
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
        
        // 2. Xây dựng lại Action Grid dựa trên layout có sẵn hoặc tạo default
        var actionGrid = document.querySelector('.action-grid');
        var existingButtons = document.querySelectorAll('[data-tool]');
        
        // Map lưu tất cả nút action hiện có (để dùng cho việc tạo row)
        var btnMap = {};
        existingButtons.forEach(function(btn) {
            var tool = btn.getAttribute('data-tool');
            btnMap[tool] = btn;
            // Reset style.display về rỗng (gỡ bỏ ẩn cũ)
            btn.style.display = '';
        });
        
        // Xóa tất cả action-row hiện tại
        actionGrid.innerHTML = '';
        
        var rowsToCreate = [];
        if (raw && layout.actionButtons && layout.actionButtons.length) {
            rowsToCreate = layout.actionButtons;
        } else {
            // Default layout nếu chưa có hoặc lỗi
            rowsToCreate = [
                ['resizeBox', 'center'],
                ['groupText', 'checkBG'],
                ['copyFX', 'pasteFX'],
                ['selectForm', 'logo']
            ];
        }
        
        // Tạo lại các row và đặt nút vào
        rowsToCreate.forEach(function(tools) {
            var row = document.createElement('div');
            row.className = 'action-row';
            tools.forEach(function(tool) {
                var btn = btnMap[tool];
                if (btn) row.appendChild(btn);
            });
            if (row.children.length > 0) actionGrid.appendChild(row);
        });
        
        // 3. Đồng bộ lại visibility (gọi sau khi đã có cấu trúc)
        var vis = loadVis();
	
        applyVis(vis);
        
        // 4. Nếu đang ở chế độ edit, khởi tạo lại Sortable cho các row mới
        if (_editMode) {
            initButtonSortable();
            enableAllButtonSortable(true);
        }
    } catch(e) { console.log(e); }
}


function resetLayout() {
    // Xóa layout đã lưu để không bị restore lại sau khi load
    localStorage.removeItem(LAYOUT_KEY);

    // 1. Sắp xếp lại thứ tự các section
    var panel = document.querySelector('.panel');
    var order = ['section-preview', 'section-split', 'section-size', 'section-actions'];
    order.forEach(function(id) {
        var sec = document.getElementById(id);
        if (sec) panel.appendChild(sec);
    });
    // Đảm bảo footer luôn ở cuối
    var footer = document.querySelector('.panel-footer');
    if (footer) panel.appendChild(footer);

    // 2. Ẩn section Layout Cases
    document.getElementById('section-layout').style.display = 'none';

    // 3. Cập nhật visibility state (lưu vào localStorage)
    var vis = loadVis();
    // Bật tất cả các tool khác, chỉ tắt layoutCases
    for (var k in TOOL_DEFS) {
        vis[k] = (k === 'layoutCases') ? false : true;
	vis[k] = (k === 'layoutCases' || k === 'manualLoadText') ? false : true;
    }
    saveVis(vis);
    applyVis(vis);  // sẽ ẩn section-layout và cập nhật checkbox

    // 4. Tạo lại action grid theo layout mặc định
    var actionGrid = document.querySelector('.action-grid');
    var allBtns = document.querySelectorAll('[data-tool]');
    var btnMap = {};
    allBtns.forEach(function(btn) {
        btnMap[btn.getAttribute('data-tool')] = btn;
        btn.style.display = ''; // reset ẩn
    });

    actionGrid.innerHTML = '';
    var defaultRows = [
        ['resizeBox', 'center'],
        ['groupText', 'checkBG'],
        ['copyFX', 'pasteFX'],
        ['selectForm', 'logo']
    ];

    defaultRows.forEach(function(tools) {
        var row = document.createElement('div');
        row.className = 'action-row';
        tools.forEach(function(tool) {
            if (btnMap[tool]) row.appendChild(btnMap[tool]);
        });
        actionGrid.appendChild(row);
    });

    // 5. Nếu đang ở chế độ edit mode → cập nhật lại Sortable
    if (_editMode) {
        initButtonSortable();
        enableAllButtonSortable(true);
    }

    // Hiệu ứng flash nhẹ báo thành công
    var settingBtn = document.getElementById("settingBtn");
    flash(settingBtn, "OK");
}

// Hàm tạo lại các action-row mặc định (nếu mất layout)
function createDefaultActionRows() {
    var actionGrid = document.querySelector('.action-grid');
    actionGrid.innerHTML = '';
    var defaultRows = [
        ['resizeBox', 'center'],
        ['groupText', 'checkBG'],
        ['copyFX', 'pasteFX'],
        ['selectForm', 'logo']
    ];
    defaultRows.forEach(function(tools) {
        var row = document.createElement('div');
        row.className = 'action-row';
        tools.forEach(function(tool) {
            var btn = document.querySelector('[data-tool="' + tool + '"]');
            if (btn) row.appendChild(btn);
        });
        actionGrid.appendChild(row);
    });
}

function saveAndExitEditMode() {
    if (!_editMode) return;
    // Gọi lại toggleEditMode để tắt chế độ chỉnh sửa
    // Hàm toggleEditMode khi _editMode === true sẽ chuyển sang false và thực hiện dọn dẹp, lưu layout
    toggleEditMode();
}



 function setupSettingPopup() {
    var btn = document.getElementById("settingBtn");
    var popup = document.getElementById("settingPopup");
    var layoutManagerSub = document.getElementById("layoutManagerSub");
    var layoutManagerArrow = document.getElementById("layoutManagerArrow");
    var toolManagerSub = document.getElementById("toolManagerSub");
    var toolManagerArrow = document.getElementById("toolManagerArrow");

    // ── Hàm đóng popup & collapse tất cả submenu ──
    function closeSettingPopup() {
        popup.classList.remove("show");
        if (layoutManagerSub) layoutManagerSub.style.display = "none";
        if (layoutManagerArrow) layoutManagerArrow.textContent = "▼";
        if (toolManagerSub) toolManagerSub.style.display = "none";
        if (toolManagerArrow) toolManagerArrow.textContent = "▼";
    }

    // ── Hàm mở popup (đảm bảo submenu luôn đóng ban đầu) ──
    function openSettingPopup() {
        // Collapse trước rồi mở
        if (layoutManagerSub) layoutManagerSub.style.display = "none";
        if (layoutManagerArrow) layoutManagerArrow.textContent = "▼";
        if (toolManagerSub) toolManagerSub.style.display = "none";
        if (toolManagerArrow) toolManagerArrow.textContent = "▼";
        popup.classList.add("show");
    }

    // ── Toggle khi bấm nút Setting ──
    btn.addEventListener("click", function(e) {
        e.stopPropagation();
        if (popup.classList.contains("show")) {
            closeSettingPopup();
        } else {
            openSettingPopup();
        }
    });

    // ── Đóng khi click bên ngoài ──
    document.addEventListener("click", function(e) {
        if (!popup.contains(e.target) && e.target !== btn) {
            closeSettingPopup();
        }
    });

    // ── XỬ LÝ CÁC MỤC DATA-ACTION (menu chính) ──
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
                    if (btnLogo) {
                        btnLogo.title = result;
                        btnLogo.classList.add("flash-ok");
                        setTimeout(function() { btnLogo.classList.remove("flash-ok"); }, 800);
                    }
                    console.log("[Logo] Đã lưu:", result);
                });
            } else if (action === "pasteAllOpened") {
                _exec("pasteLogoToAllDocs()", null, function(res) {
                    console.log("[PasteLogo]", res);
                    if (res !== "OK") alert("Lỗi: " + res);
                });
            } else if (action === "toggleEditMode") {
                toggleEditMode();
                closeSettingPopup();   // đóng popup ngay
                return;                // không rơi vào lệnh close bên dưới
            } else if (action === "resetLayout") {
                resetLayout();
            }
            closeSettingPopup();   // mọi action còn lại đều đóng popup + collapse submenu
        });
    });

    // ── XỬ LÝ CÁC CHECKBOX TOGGLE (giữ nguyên) ──
    popup.querySelectorAll("input[type='checkbox']").forEach(function(cb) {
        cb.addEventListener("click", function(e) {
            e.stopPropagation();
            var key = this.id.replace("toggle_", "");
            if (TOOL_DEFS.hasOwnProperty(key)) {
                var vis = loadVis();
                vis[key] = this.checked;
                saveVis(vis);
                applyVis(vis);
                if (key === "actionsSection") {
                    // (để trống)
                }
                if (key === "manualLoadText") {
                    var overlay = document.getElementById("previewOverlay");
                    if (overlay && overlay.style.display === "block") {
                        if (vis.manualLoadText) {
                            if (previewInterval) { clearInterval(previewInterval); previewInterval = null; }
                        } else {
                            if (!previewInterval) { previewInterval = setInterval(window.updatePreviewIfNeeded, 1000); }
                        }
                    }
                }
            }
        });
    });

    // ── XỬ LÝ SUBMENU Layout Manager ──
    var layoutToggle = document.getElementById("layoutManagerToggle");
    if (layoutToggle) {
        layoutToggle.addEventListener("click", function(e) {
            e.stopPropagation();
            if (layoutManagerSub.style.display === "none") {
                layoutManagerSub.style.display = "block";
                layoutManagerArrow.textContent = "▲";
            } else {
                layoutManagerSub.style.display = "none";
                layoutManagerArrow.textContent = "▼";
            }
        });
    }

    // ── XỬ LÝ SUBMENU Tool Manager ──
    var toolToggle = document.getElementById("toolManagerToggle");
    if (toolToggle) {
        toolToggle.addEventListener("click", function(e) {
            e.stopPropagation();
            if (toolManagerSub.style.display === "none") {
                toolManagerSub.style.display = "block";
                toolManagerArrow.textContent = "▲";
            } else {
                toolManagerSub.style.display = "none";
                toolManagerArrow.textContent = "▼";
            }
        });
    }

    // Đồng bộ checkbox ban đầu
    updateCheckboxes(loadVis());
}

  // ========== PREVIEW POPUP ==========
  function setupPreviewPopup() {
    var overlay = document.getElementById("previewOverlay");
    var btnOpen = document.getElementById("btnPreviewLayout");
    var btnLoad = document.getElementById("btnPreviewLoad");
    var btnClose = document.getElementById("btnPreviewClose");
    var btnToggle = document.getElementById("btnPreviewToggle");
    btnToggle.textContent = "H";
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

    function updateSizeUI() { sizeDisplay.textContent = previewSize; saveFontsToStorage(); applyFontAndSizeToPreview(); }
    function applyFontAndSizeToPreview() {
        var items = grid.querySelectorAll(".preview-item");
        var font = (selectedFontIndex >= 0 && customFonts[selectedFontIndex]) ? customFonts[selectedFontIndex] : "";
        items.forEach(function(item) { item.style.fontSize = previewSize + "px"; item.style.fontFamily = font ? '"' + font + '"' : ""; });
    }

    function renderFontList() {
    fontPickerList.innerHTML = "";
    if (customFonts.length === 0) {
        fontPickerList.innerHTML = '<div style="padding:10px;color:#888;">No fonts. Click "Add".</div>';
        return;
    }
    customFonts.forEach(function(f, index) {
        var div = document.createElement("div");
        div.className = "font-item" + (index === selectedFontIndex ? " selected" : "");

        // ── Số thứ tự ──
        var indexSpan = document.createElement("span");
        indexSpan.className = "font-index";
        indexSpan.textContent = (index + 1);
        indexSpan.addEventListener("click", function(e) {
            e.stopPropagation();
            selectFont(index);
        });
        div.appendChild(indexSpan);

        // ── Tên font ──
        var nameSpan = document.createElement("span");
        nameSpan.className = "font-name";
        nameSpan.textContent = f;
        nameSpan.addEventListener("click", function(e) {
            e.stopPropagation();
            // Nếu đang hiển thị input thì không làm gì thêm
            if (nameSpan.querySelector("input")) return;

            var oldName = customFonts[index];
            var input = document.createElement("input");
            input.type = "text";
            input.value = oldName;
            input.style.width = "100%";
            nameSpan.innerHTML = "";
            nameSpan.appendChild(input);
            input.focus();
            input.select();

            function finishEdit() {
                var newName = input.value.trim();
                if (newName && newName !== oldName) {
                    if (customFonts.includes(newName)) {
                        alert("Font name already exists.");
                        input.value = oldName;
                    } else {
                        customFonts[index] = newName;
                        saveFontsToStorage();
                    }
                }
                // Render lại toàn bộ danh sách
                renderFontList();
                // Giữ selected hợp lệ
                if (selectedFontIndex >= customFonts.length) selectedFontIndex = -1;
                saveFontsToStorage();
                applyFontAndSizeToPreview();
            }

            input.addEventListener("blur", finishEdit);
            input.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    input.blur();
                }
                e.stopPropagation();
            });
        });
        div.appendChild(nameSpan);

        // ── Nút xóa ──
        var removeSpan = document.createElement("span");
        removeSpan.className = "font-remove";
        removeSpan.textContent = "✕";
        removeSpan.addEventListener("click", function(e) {
            e.stopPropagation();
            removeFont(index);
        });
        div.appendChild(removeSpan);

        fontPickerList.appendChild(div);
    });
}

    function selectFont(index) { selectedFontIndex = index; saveFontsToStorage(); renderFontList(); applyFontAndSizeToPreview(); fontPicker.style.display = "none"; }
    function removeFont(index) { customFonts.splice(index,1); if(selectedFontIndex === index) selectedFontIndex = -1; else if(selectedFontIndex > index) selectedFontIndex--; saveFontsToStorage(); renderFontList(); applyFontAndSizeToPreview(); }


    function addFont() {
    if (customFonts.length >= maxFonts) {
        alert("Maximum " + maxFonts + " fonts allowed.");
        return;
    }
    var inputField = document.getElementById("newFontName");
    var fontName = inputField ? inputField.value.trim() : "";
    if (!fontName) {
        alert("Please enter a font name.");
        return;
    }
    if (customFonts.includes(fontName)) {
        alert("Font already in the list.");
        return;
    }
    customFonts.push(fontName);
    saveFontsToStorage();
    renderFontList();
    selectFont(customFonts.length - 1);
    if (inputField) inputField.value = ""; // clear input
}

    // Khi bấm nút Font, lấy font hiện tại từ Photoshop để gợi ý
btnFont.addEventListener("click", function() {
    renderFontList();
    fontPicker.style.display = "flex";
    // Lấy font hiện tại và đặt vào input
    cs.evalScript('getTextFont()', function(layerFont) {
        var input = document.getElementById("newFontName");
        if (input && layerFont && layerFont !== "ERROR" && layerFont !== "NO_LAYER") {
            input.value = layerFont;
        }
    });
});
    btnFontClose.addEventListener("click", function() { fontPicker.style.display = "none"; });
    btnAddFont.addEventListener("click", addFont);
    btnSizeDown.addEventListener("click", function() { if (previewSize > 1) previewSize--; updateSizeUI(); });
    btnSizeUp.addEventListener("click", function() { if (previewSize < 999) previewSize++; updateSizeUI(); });
    loadFontsFromStorage();

    function renderPreviews(text) {
        grid.innerHTML = "";
        for (var n = 1; n <= 9; n++) {
            var formatted = getCasePreview(text, n);
            var item = document.createElement("div");
            item.className = "preview-item";
            if (selectedFontIndex >= 0 && customFonts[selectedFontIndex]) item.style.fontFamily = '"' + customFonts[selectedFontIndex] + '"';
            item.style.fontSize = previewSize + "px";
            item.innerHTML = formatted.replace(/\n/g, "<br>");
            item.addEventListener("click", (function(caseNum){ return function(){ _exec('applyCase(' + caseNum + ')'); }; })(n));
            grid.appendChild(item);
        }
    }

    function updatePreviewIfNeeded() {
        cs.evalScript('getText()', function(text) {
            if (!text || text.indexOf("ERROR") >= 0) return;
            if (text === lastPreviewText) return;
            lastPreviewText = text;
            if (!text.trim()) { grid.innerHTML = ""; return; }
            renderPreviews(text);
        });
    }
    window.updatePreviewIfNeeded = updatePreviewIfNeeded;

    function loadPreviews() {
        cs.evalScript('getText()', function(text) {
            if (!text || text.indexOf("ERROR") >= 0) { alert("Không tìm thấy text layer!"); return; }
            if (!text.trim()) { alert("Text layer rỗng."); return; }
            lastPreviewText = text;
            renderPreviews(text);
        });
    }

    btnToggle.addEventListener("click", function() {
        isHorizontal = !isHorizontal;
        if (isHorizontal) { grid.classList.add("horizontal"); btnToggle.textContent = "V"; }
        else { grid.classList.remove("horizontal"); btnToggle.textContent = "H"; }
    });

    btnOpen.addEventListener("click", function() {
        overlay.style.display = "block";
        loadPreviews();
        if (previewInterval) clearInterval(previewInterval);
        var vis = loadVis();
        if (!vis.manualLoadText) previewInterval = setInterval(updatePreviewIfNeeded, 1000);
    });

    function closePopup() {
    overlay.style.display = "none";
    // Lưu chiều cao hiện tại của popup
    var popup = document.getElementById('previewPopup');
    if (popup) {
        var h = popup.offsetHeight;
        if (h > 0) localStorage.setItem('typoCorePreviewPopupHeight', h);
    }
    if (previewInterval) { clearInterval(previewInterval); previewInterval = null; }
}
    btnClose.addEventListener("click", closePopup);
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closePopup(); });
    btnLoad.addEventListener("click", loadPreviews);
    var popupEl = document.getElementById('previewPopup');
    var handleEl = document.querySelector('.resize-handle');
    if (popupEl && handleEl) {
    // Khôi phục chiều cao đã lưu từ localStorage
    var savedHeight = localStorage.getItem('typoCorePreviewPopupHeight');
    if (savedHeight && !isNaN(savedHeight)) {
        popupEl.style.height = savedHeight + 'px';
    }
    makeResizable(popupEl, handleEl);
}
    btnOpen.click();
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
    function stopDrag() {
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
    }
}


  // ========== KHỞI ĐỘNG ==========
  (function init() {
    restoreLayout();          // phục hồi thứ tự section & nút
    var vis = loadVis();
    applyVis(vis);
    var savedLogo = localStorage.getItem("typoCoreLogoPath");
    if (savedLogo) {
      cs.evalScript('LOGO_PATH = "' + savedLogo.replace(/"/g, '\\"') + '"');
      var btnLogo = document.getElementById("btnLogo");
      if (btnLogo) btnLogo.title = savedLogo;
	var actionsSection = document.getElementById('section-actions');
if (actionsSection) {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style') {
                var isVisible = window.getComputedStyle(actionsSection).display !== 'none';
                if (!isVisible) {
                    document.body.classList.add('actions-hidden');
                } else {
                    document.body.classList.remove('actions-hidden');
                }
            }
        });
    });
    observer.observe(actionsSection, { attributes: true, attributeFilter: ['style'] });
    // Khởi tạo trạng thái ban đầu
    var isVisible = window.getComputedStyle(actionsSection).display !== 'none';
    if (!isVisible) document.body.classList.add('actions-hidden');
    else document.body.classList.remove('actions-hidden');
}
      console.log("[Logo] Đã phục hồi:", savedLogo);
    }

    setupSettingPopup();
    document.getElementById("addRowBtn")?.addEventListener("click", addNewRow);
    document.getElementById("saveLayoutBtn")?.addEventListener("click", saveAndExitEditMode);
    // Xóa hàng trống khi click vào nó (chỉ trong edit mode)
document.querySelector('.action-grid').addEventListener('click', function(e) {
    if (!_editMode) return;
    let row = e.target.closest('.action-row');
    if (row && row.querySelectorAll('[data-tool]').length === 0) {
        row.remove();
        saveLayout();
        // Cập nhật lại Sortable vì DOM thay đổi
        if (_editMode) {
            initButtonSortable();
            enableAllButtonSortable(true);
        }
    }
});
    setupPreviewPopup();
    console.log("[TypoCore] Ready with all features");
  })();

  function applyCase(n) { _exec('applyCase(' + n + ')'); }
  function splitEven(n) { _exec('splitEven(' + n + ')'); }
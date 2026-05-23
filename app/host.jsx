#target photoshop
// ============================================================
//  TypoCore v3 – CEP Host Script (Final)
//  Hỗ trợ đa stroke, JSON an toàn
// ============================================================

// JSON polyfill
if (typeof JSON === "undefined") { JSON = {}; }
if (typeof JSON.parse !== "function") {
    JSON.parse = function(s) { return eval('(' + s + ')'); };
}
if (typeof JSON.stringify !== "function") {
    JSON.stringify = function(obj) {
        if (obj === null) return "null";
        if (typeof obj === "number" || typeof obj === "boolean") return obj.toString();
        if (typeof obj === "string") return '"' + obj + '"';
        if (obj instanceof Array) {
            var arr = [];
            for (var i = 0; i < obj.length; i++) arr.push(JSON.stringify(obj[i]));
            return "[" + arr.join(",") + "]";
        }
        var str = [];
        for (var key in obj) str.push('"' + key + '":' + JSON.stringify(obj[key]));
        return "{" + str.join(",") + "}";
    };
}

// ========== CORE FUNCTIONS ==========
var memory = {};
var _typoCoreLoaded = true;

function getLayer() {
    if (!app.documents.length) return null;
    var l = app.activeDocument.activeLayer;
    return (l.kind == LayerKind.TEXT) ? l : null;
}

function getText() {
    var layer = getLayer();
    if (!layer) return null;
    var id = layer.id;
    if (!memory[id] || memory[id] != layer.textItem.contents)
        memory[id] = layer.textItem.contents;
    return memory[id];
}

function cleanText(str) {
    return str.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
}

function splitWords(str) { return cleanText(str).split(" "); }

function applyPattern(pattern) {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    var words = splitWords(getText());
    var total = words.length;
    var sum = 0;
    for (var i = 0; i < pattern.length; i++) sum += pattern[i];
    var np = pattern.slice();
    if (total > sum) {
        var extra = total - sum;
        var len = np.length;
        if (len % 2 == 1) np[Math.floor(len / 2)] += extra;
        else {
            var m1 = Math.floor(len / 2) - 1, m2 = Math.floor(len / 2);
            np[m1] += Math.floor(extra / 2);
            np[m2] += extra - Math.floor(extra / 2);
        }
    }
    var result = "", index = 0;
    for (var i = 0; i < np.length; i++) {
        var line = [];
        for (var j = 0; j < np[i]; j++) if (words[index]) line.push(words[index++]);
        result += line.join(" ");
        if (i < np.length - 1) result += "\r";
    }
    layer.textItem.contents = result;
    //app.refresh();
    return "OK";
}

var data = {
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

function getClosest(n, map) {
    var closest = null, min = 9999;
    for (var k in map) {
        var diff = Math.abs(n - parseInt(k));
        if (diff < min) { min = diff; closest = k; }
    }
    return map[closest];
}

function applyCase(n) {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    return applyPattern(getClosest(splitWords(getText()).length, data[n]));
}

function splitEven(lines) {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    var words = splitWords(getText());
    var total = words.length;
    var base = Math.floor(total / lines);
    var extra = total % lines;

    // Tạo mảng pattern với tất cả dòng = base
    var pattern = [];
    for (var i = 0; i < lines; i++) {
        pattern.push(base);
    }

    // Phân phối số chữ dư (extra) cho các dòng giữa
    if (extra > 0) {
        if (lines === 3) {
            // 3 dòng: thêm hết extra vào dòng giữa (index 1)
            pattern[1] += extra;
        } else if (lines === 4) {
            // 4 dòng: thêm vào 2 dòng giữa (index 1 và 2), mỗi dòng tối đa 1
            if (extra >= 1) { pattern[1] += 1; extra--; }
            if (extra >= 1) { pattern[2] += 1; extra--; }
            // Nếu vẫn còn dư (rất hiếm với 4 dòng) thì thêm vào dòng đầu
            if (extra > 0) { pattern[0] += extra; }
        } else {
            // Các trường hợp khác (2 dòng, 5+ dòng): giữ nguyên phân phối từ trên xuống
            for (var i = 0; i < extra; i++) {
                pattern[i] += 1;
            }
        }
    }

    return applyPattern(pattern);
}

var _typoCoreResizeResult = "";

function resizeBox() {
    _typoCoreResizeResult = "";
    try {
        app.activeDocument.suspendHistory("TypoCore Resize Box", "_resizeBoxInternal()");
        return _typoCoreResizeResult || "OK";
    } catch(e) {
        return "ERROR:" + e.message;
    }
}

function _resizeBoxInternal() {
    var layer = getLayer();
    if (!layer) {
        _typoCoreResizeResult = "NO_LAYER";
        return;
    }
    try {
        var doc = app.activeDocument;
        var t = layer.textItem;
        var wasPoint = (t.kind == TextType.POINTTEXT);
        
        // 1. Lưu vị trí hiện tại (tâm layer)
        var oldBounds = layer.bounds;
        var oldCenterX = (oldBounds[0].as("px") + oldBounds[2].as("px")) / 2;
        var oldCenterY = (oldBounds[1].as("px") + oldBounds[3].as("px")) / 2;
        
        // 2. Nếu là point text thì chuyển sang paragraph text trước
        if (wasPoint) t.kind = TextType.PARAGRAPHTEXT;
        
        // 3. Mở rộng khung rất lớn để toàn bộ chữ hiển thị
        t.width  = new UnitValue(1500, "px");
        t.height = new UnitValue(1500, "px");
        
        // 4. Chuyển sang point text để đo chính xác (không mất chữ vì đã mở rộng)
        t.kind = TextType.POINTTEXT;
        
        // 5. Đo bounds thực tế
        var b = layer.bounds;
        var rW = b[2].as("px") - b[0].as("px");
        var rH = b[3].as("px") - b[1].as("px");
        
        // 6. Chuyển về paragraph text và set kích thước mới
        t.kind = TextType.PARAGRAPHTEXT;
        var padW = 80;
        var padH = 22;
        t.width  = new UnitValue(rW + padW, "px");
        t.height = new UnitValue(rH + padH, "px");
        
        // 7. Đưa layer về đúng vị trí cũ
        var newBounds = layer.bounds;
        var newCenterX = (newBounds[0].as("px") + newBounds[2].as("px")) / 2;
        var newCenterY = (newBounds[1].as("px") + newBounds[3].as("px")) / 2;
        layer.translate(new UnitValue(oldCenterX - newCenterX, "px"), new UnitValue(oldCenterY - newCenterY, "px"));
        
        _typoCoreResizeResult = "OK";
    } catch(e) {
        _typoCoreResizeResult = "ERROR:" + e.message;
    }
}



function alignCenter() {
    var doc = app.activeDocument;
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    try {
        // Lấy center vùng chọn, nếu không có thì dùng canvas
        var cx, cy, hadSelection = false;
        try {
            var sel = doc.selection.bounds;
            cx = (sel[0].as("px") + sel[2].as("px")) / 2;
            cy = (sel[1].as("px") + sel[3].as("px")) / 2;
            hadSelection = true;
        } catch(e) {
            cx = doc.width.as("px") / 2;
            cy = doc.height.as("px") / 2;
        }

        // Rasterize bản sao để lấy bounds thực của chữ (bỏ qua khung paragraph)
        var dup = layer.duplicate();
        dup.rasterize(RasterizeType.ENTIRELAYER);
        var tb = dup.bounds;
        var tx = (tb[0].as("px") + tb[2].as("px")) / 2;
        var ty = (tb[1].as("px") + tb[3].as("px")) / 2;
        dup.remove();

        // Dịch chuyển layer gốc theo đúng pixel chữ
        layer.translate(new UnitValue(cx - tx, "px"), new UnitValue(cy - ty, "px"));

        if (hadSelection) doc.selection.deselect();
        app.refresh();
        return "OK";
    } catch(e) { return "ERROR:" + e.message; }
}

function _doApplySize(layer, applySize, applyLead) {
    try {
        var t = layer.textItem;
        var currentSize = t.size.as("pt");
        var ns = currentSize + applySize;
        if (ns < 1) ns = 1;
        t.size = new UnitValue(ns, "pt");
        try {
            var currentLead = t.leading.as("pt");
            var nl = currentLead + applyLead;
            if (nl < 0) nl = 0;
            t.leading = new UnitValue(nl, "pt");
        } catch(e2) {}
        return "OK";
    } catch(e) { return "ERROR:" + e.message; }
}

function applyNow(dSize, dLead) {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    try {
        var t = layer.textItem;
        var curSize = t.size.as("pt");
        var curLead = 0;
        try { curLead = t.leading.as("pt"); } catch(e) {}
        if (curLead <= 0) curLead = curSize * 1.2;

        var newSize = curSize + dSize;
        var newLead = curLead + dLead;
        if (newSize < 1) newSize = 1;
        if (newLead < 0) newLead = 0;

        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("TxtS"));
        ref.putEnumerated(charIDToTypeID("TxLr"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("null"), ref);

        var textStyle = new ActionDescriptor();
        textStyle.putUnitDouble(charIDToTypeID("Sz  "), charIDToTypeID("Pts "), newSize);
        textStyle.putUnitDouble(charIDToTypeID("Ldng"), charIDToTypeID("Pts "), newLead);
        desc.putObject(charIDToTypeID("T   "), charIDToTypeID("TxtS"), textStyle);

        executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
        return "OK";
    } catch(e) {
        return "ERROR:" + e.message;
    }
}

function selectLayerByID(id) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
}

function pasteFX() {
    if (!_copiedFX || !app.documents.length) return "NO_FX";
    var doc = app.activeDocument;
    var ids = [];
    try {
        var ref = new ActionReference();
        ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("targetLayersIDs"));
        ref.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
        var desc = executeActionGet(ref);
        var list = desc.getList(stringIDToTypeID("targetLayersIDs"));
        for (var i = 0; i < list.count; i++) ids.push(list.getReference(i).getIdentifier());
    } catch(e) { ids.push(doc.activeLayer.id); }
    var srcFX = _copiedFX;
    for (var i = 0; i < ids.length; i++) {
        try {
            selectLayerByID(ids[i]);
            var layerRef = new ActionReference();
            layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var setDesc = new ActionDescriptor();
            setDesc.putReference(charIDToTypeID("null"), layerRef);
            var layerDesc = new ActionDescriptor();
            layerDesc.putObject(stringIDToTypeID("layerEffects"), stringIDToTypeID("layerEffects"), srcFX);
            setDesc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), layerDesc);
            executeAction(charIDToTypeID("setd"), setDesc, DialogModes.NO);
            if (_copiedColor) {
                try {
                    var tgtLayer = doc.activeLayer;
                    if (tgtLayer.kind == LayerKind.TEXT) {
                        var nc = new SolidColor();
                        nc.rgb.red   = _copiedColor.r;
                        nc.rgb.green = _copiedColor.g;
                        nc.rgb.blue  = _copiedColor.b;
                        tgtLayer.textItem.color = nc;
                    }
                } catch(ec) {}
            }
        } catch(e) {}
    }
    app.refresh();
    return "OK";
}

function selectForm() {
    if (!app.documents.length) return "NO_DOC";
    try {
        var doc = app.activeDocument;
        var workPath = doc.pathItems.getByName("Work Path");
        workPath.makeSelection(0, false, SelectionType.REPLACE);
        workPath.remove();
        app.refresh();
        return "OK";
    } catch(e) { return "NO_PATH"; }
}

var LOGO_PATH = "";
function pickLogoPath() {
    try {
        var f = File.openDialog("Chọn file logo", "*.png;*.jpg;*.jpeg;*.tif;*.tiff;*.psd;*.ai;*.eps", false);
        if (!f) return "CANCELLED";
        LOGO_PATH = f.fsName.replace(/\\/g, "/");
        return LOGO_PATH;
    } catch(e) { return "ERROR:" + e.message; }
}
function placeLogo() {
    if (!app.documents.length) return "NO_DOC";
    try {
        var f = new File(LOGO_PATH);
        if (!f.exists) return "NO_FILE";
        var idPlc = charIDToTypeID("Plc ");
        var desc  = new ActionDescriptor();
        desc.putPath(charIDToTypeID("null"), f);
        desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
        executeAction(idPlc, desc, DialogModes.NO);
        app.refresh();
        return "OK";
    } catch(e) { return "ERROR:" + e.message; }
}
function pasteLogoToAllDocs() {
    if (!app.documents.length) return "NO_DOC";
    if (!LOGO_PATH) return "NO_LOGO_SELECTED";
    var logoFile = new File(LOGO_PATH);
    if (!logoFile.exists) return "LOGO_FILE_NOT_FOUND";
    var originalDoc = app.activeDocument;
    try {
        for (var i = 0; i < app.documents.length; i++) {
            var doc = app.documents[i];
            app.activeDocument = doc;
            var idPlc = charIDToTypeID("Plc ");
            var desc = new ActionDescriptor();
            desc.putPath(charIDToTypeID("null"), logoFile);
            desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
            executeAction(idPlc, desc, DialogModes.NO);
            var logoLayer = doc.activeLayer;
            if (logoLayer) {
                var docW = doc.width.as("px");
                var docH = doc.height.as("px");
                var bounds = logoLayer.bounds;
                var layerH = bounds[3].as("px") - bounds[1].as("px");
                var newX = 0;
                var newY = (docH - layerH) / 2;
                var currentX = bounds[0].as("px");
                var currentY = bounds[1].as("px");
                logoLayer.translate(newX - currentX, newY - currentY);
            }
        }
        app.activeDocument = originalDoc;
        app.refresh();
        return "OK";
    } catch(e) {
        try { app.activeDocument = originalDoc; } catch(e2) {}
        return "ERROR:" + e.message;
    }
}
function toggleCheck() {
    if (!app.documents.length) return "NO_DOC";
    var doc = app.activeDocument, checkLayer = null;
    function findCheck(layers) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].name == "CHECK") { checkLayer = layers[i]; return; }
            if (layers[i].typename == "LayerSet") findCheck(layers[i].layers);
        }
    }
    findCheck(doc.layers);
    if (checkLayer) { try { checkLayer.remove(); } catch(e) {} return "REMOVED"; }
    function getAllFlat(parent, result) {
        for (var i = 0; i < parent.layers.length; i++) {
            result.push(parent.layers[i]);
            if (parent.layers[i].typename == "LayerSet") getAllFlat(parent.layers[i], result);
        }
    }
    var flat = [], textLayers = [];
    getAllFlat(doc, flat);
    for (var i = 0; i < flat.length; i++)
        if (flat[i].typename == "ArtLayer" && flat[i].kind == LayerKind.TEXT)
            textLayers.push(flat[i]);
    if (!textLayers.length) return "NO_TEXT";
    var nl = doc.artLayers.add();
    nl.name = "CHECK";
    nl.move(textLayers[textLayers.length - 1], ElementPlacement.PLACEAFTER);
    var color = new SolidColor();
    color.rgb.red = 249; color.rgb.green = 255; color.rgb.blue = 76;
    doc.selection.selectAll();
    doc.selection.fill(color);
    doc.selection.deselect();
    nl.opacity = 70;
    return "OK";
}
function getTextFont() {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    try {
        var font = layer.textItem.font;
        if (font && font.name) return font.name;
        if (font && font.postScriptName) return font.postScriptName;
        return "Arial";
    } catch(e) { return "ERROR:" + e.message; }
}
function groupTextLayers() {
    if (!app.documents.length) return "NO_DOC";
    var doc = app.activeDocument, textLayers = [];
    function collect(layers) {
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].typename == "ArtLayer" && layers[i].kind == LayerKind.TEXT)
                textLayers.push(layers[i]);
            else if (layers[i].typename == "LayerSet")
                collect(layers[i].layers);
        }
    }
    collect(doc.layers);
    if (!textLayers.length) return "NO_TEXT";
    var tg = null;
    for (var i = 0; i < doc.layerSets.length; i++) {
        if (doc.layerSets[i].name == "TEXT") { tg = doc.layerSets[i]; break; }
    }
    if (!tg) { tg = doc.layerSets.add(); tg.name = "TEXT"; }
    for (var i = 0; i < textLayers.length; i++) {
        try { textLayers[i].move(tg, ElementPlacement.INSIDE); } catch(e) {}
    }
    return "OK";
}

// Hàm đọc layer effects hiện tại
function getCurrentLayerEffects() {
    try {
        if (!app.documents.length) return null;
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc = executeActionGet(ref);
        var fxKey = stringIDToTypeID("layerEffects");
        if (desc.hasKey(fxKey)) {
            return desc.getObjectValue(fxKey);
        }
        return null;
    } catch(e) { return null; }
}

// Hàm tạo gradient descriptor (copy chính xác từ _applyFX)
function createGradientDescriptor(gfData) {
    var gf = new ActionDescriptor();
    gf.putBoolean(stringIDToTypeID("enabled"), true);
    gf.putBoolean(stringIDToTypeID("present"), true);
    gf.putBoolean(stringIDToTypeID("showInDialog"), true);
    gf.putEnumerated(stringIDToTypeID("mode"), stringIDToTypeID("blendMode"), stringIDToTypeID("normal"));
    gf.putUnitDouble(stringIDToTypeID("opacity"), stringIDToTypeID("percentUnit"), 100);
    gf.putUnitDouble(stringIDToTypeID("angle"), stringIDToTypeID("angleUnit"), gfData.angle || 0);
    gf.putEnumerated(stringIDToTypeID("type"), stringIDToTypeID("gradientType"), stringIDToTypeID(gfData.type || "linear"));
    gf.putBoolean(stringIDToTypeID("reverse"), false);
    gf.putBoolean(stringIDToTypeID("dither"), false);
    gf.putBoolean(stringIDToTypeID("align"), true);
    gf.putUnitDouble(stringIDToTypeID("scale"), stringIDToTypeID("percentUnit"), 100);

    var grad = new ActionDescriptor();
    grad.putString(stringIDToTypeID("name"), "Custom");
    grad.putEnumerated(stringIDToTypeID("gradientForm"), stringIDToTypeID("gradientForm"), stringIDToTypeID("customStops"));
    grad.putInteger(stringIDToTypeID("interfaceIconFrameDimmed"), 4096);

    var colorList = new ActionList();
    var cols = gfData.colors || [];
    // Đảm bảo có ít nhất 2 màu
    if (cols.length === 0) cols = [{r:0,g:0,b:0}, {r:255,g:255,b:255}];
    if (cols.length === 1) cols = [cols[0], cols[0]];
    for (var c = 0; c < cols.length; c++) {
        var stop = new ActionDescriptor();
        var colorD = new ActionDescriptor();
        colorD.putDouble(stringIDToTypeID("red"), cols[c].r);
        colorD.putDouble(stringIDToTypeID("green"), cols[c].g);
        colorD.putDouble(stringIDToTypeID("blue"), cols[c].b);
        stop.putObject(stringIDToTypeID("color"), stringIDToTypeID("RGBColor"), colorD);
        stop.putEnumerated(stringIDToTypeID("type"), stringIDToTypeID("colorStopType"), stringIDToTypeID("userStop"));
        stop.putInteger(stringIDToTypeID("location"), c === 0 ? 0 : 4096);
        stop.putInteger(stringIDToTypeID("midpoint"), 50);
        colorList.putObject(stringIDToTypeID("colorStop"), stop);
    }
    grad.putList(stringIDToTypeID("colors"), colorList);

    var transList = new ActionList();
    for (var t = 0; t < 2; t++) {
        var ts = new ActionDescriptor();
        ts.putUnitDouble(stringIDToTypeID("opacity"), stringIDToTypeID("percentUnit"), 100);
        ts.putInteger(stringIDToTypeID("location"), t === 0 ? 0 : 4096);
        ts.putInteger(stringIDToTypeID("midpoint"), 50);
        transList.putObject(stringIDToTypeID("transferSpec"), ts);
    }
    grad.putList(stringIDToTypeID("transparency"), transList);

    gf.putObject(stringIDToTypeID("gradient"), stringIDToTypeID("gradientClassEvent"), grad);
    return gf;
}

// Hàm tạo stroke descriptor (giống trong _applyFX)
function createStrokeDescriptor(strokeData) {
    var st = new ActionDescriptor();
    st.putBoolean(stringIDToTypeID("enabled"), true);
    st.putBoolean(stringIDToTypeID("present"), true);
    st.putEnumerated(stringIDToTypeID("style"), stringIDToTypeID("frameStyle"), stringIDToTypeID("outsetFrame"));
    st.putEnumerated(stringIDToTypeID("paintType"), stringIDToTypeID("frameFill"), stringIDToTypeID("solidColor"));
    st.putEnumerated(stringIDToTypeID("mode"), stringIDToTypeID("blendMode"), stringIDToTypeID("normal"));
    st.putUnitDouble(stringIDToTypeID("opacity"), stringIDToTypeID("percentUnit"), 100);
    st.putUnitDouble(stringIDToTypeID("size"), stringIDToTypeID("pixelsUnit"), strokeData.size || 1);
    st.putBoolean(stringIDToTypeID("overprint"), false);
    var stColor = new ActionDescriptor();
    stColor.putDouble(stringIDToTypeID("red"), strokeData.color.r);
    stColor.putDouble(stringIDToTypeID("green"), strokeData.color.g);
    stColor.putDouble(stringIDToTypeID("blue"), strokeData.color.b);
    st.putObject(stringIDToTypeID("color"), stringIDToTypeID("RGBColor"), stColor);
    return st;
}

// Merge FX (thêm/cập nhật, không xóa các effect khác)
function _applyFXMerge(newData) {
    var setDesc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    setDesc.putReference(charIDToTypeID("null"), ref);
    
    // Lấy current effects
    var currentEffects = getCurrentLayerEffects();
    var effDesc = currentEffects ? currentEffects : new ActionDescriptor();
    
    // Gradient: nếu có thì ghi đè (cập nhật) – không ảnh hưởng stroke
    if (newData.gradientFill) {
        try {
            var gf = createGradientDescriptor(newData.gradientFill);
            effDesc.putObject(stringIDToTypeID("gradientFill"), stringIDToTypeID("gradientFill"), gf);
        } catch(e) { return "ERROR: gradient " + e.message; }
    }
    
    // Stroke: nếu có thì xóa stroke cũ và thêm mới (ghi đè stroke)
    // Điều này có nghĩa là add stroke sẽ thay thế hoàn toàn stroke hiện có (phù hợp với logic UI)
    if (newData.strokes) {
        try {
            // Xóa tất cả stroke cũ (tối đa 10)
            for (var i = 1; i <= 10; i++) {
                var key = (i === 1) ? "frameFX" : "frameFX" + i;
                try { effDesc.erase(stringIDToTypeID(key)); } catch(e) {}
            }
            // Thêm mới
            for (var s = 0; s < newData.strokes.length; s++) {
                var st = createStrokeDescriptor(newData.strokes[s]);
                var keyStr = (s === 0) ? "frameFX" : "frameFX" + (s + 1);
                effDesc.putObject(stringIDToTypeID(keyStr), stringIDToTypeID("frameFX"), st);
            }
        } catch(e) { return "ERROR: stroke " + e.message; }
    }
    
    // Outer Glow: cập nhật nếu có
    if (newData.outerGlow) {

        try {
            var og = new ActionDescriptor();
            og.putBoolean(stringIDToTypeID("enabled"), true);
            og.putBoolean(stringIDToTypeID("present"), true);
            og.putBoolean(stringIDToTypeID("showInDialog"), true);
            og.putEnumerated(stringIDToTypeID("mode"), stringIDToTypeID("blendMode"), stringIDToTypeID("normal"));
            og.putUnitDouble(stringIDToTypeID("opacity"), stringIDToTypeID("percentUnit"), newData.outerGlow.opacity || 100);
            og.putEnumerated(stringIDToTypeID("glowTechnique"), stringIDToTypeID("matteTechnique"), stringIDToTypeID("softMatte"));
            og.putUnitDouble(stringIDToTypeID("chokeMatte"), stringIDToTypeID("pixelsUnit"), newData.outerGlow.chokeMatte || 0);
            og.putUnitDouble(stringIDToTypeID("blur"), stringIDToTypeID("pixelsUnit"), newData.outerGlow.blur || 10);
            og.putUnitDouble(stringIDToTypeID("noise"), stringIDToTypeID("percentUnit"), 0);
            og.putBoolean(stringIDToTypeID("antiAlias"), false);
            og.putUnitDouble(stringIDToTypeID("inputRange"), stringIDToTypeID("percentUnit"), 50);
            var ogColor = new ActionDescriptor();
            ogColor.putDouble(stringIDToTypeID("red"), newData.outerGlow.color.r);
            ogColor.putDouble(stringIDToTypeID("green"), newData.outerGlow.color.g);
            ogColor.putDouble(stringIDToTypeID("blue"), newData.outerGlow.color.b);
            og.putObject(stringIDToTypeID("color"), stringIDToTypeID("RGBColor"), ogColor);
            effDesc.putObject(stringIDToTypeID("outerGlow"), stringIDToTypeID("outerGlow"), og);
        } catch(e) { return "ERROR: outerGlow " + e.message; }
    }
    
    // Ghi lại layer effects
    var layerDesc = new ActionDescriptor();
    layerDesc.putObject(stringIDToTypeID("layerEffects"), stringIDToTypeID("layerEffects"), effDesc);
    setDesc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), layerDesc);
    executeAction(charIDToTypeID("setd"), setDesc, DialogModes.NO);
    app.refresh();
    return "OK";
}



// ========== FX MANAGER ==========
function safeGetUnitDouble(desc, key) {
    try { return desc.getUnitDoubleValue(stringIDToTypeID(key)); } catch(e) {}
    try { return desc.getDouble(stringIDToTypeID(key)); } catch(e) {}
    return 0;
}
function getColorFromDesc(desc) {
    try {
        var r = desc.getDouble(stringIDToTypeID("red"));
        var g = desc.getDouble(stringIDToTypeID("green"));
        var b = desc.getDouble(stringIDToTypeID("blue"));
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    } catch(e) { return { r:0, g:0, b:0 }; }
}
function getFXData() {
    try {
        if (!app.documents.length) return "NO_DOC";
        var out = {};

        // Lấy màu chữ (text color) – luôn thực hiện, không phụ thuộc vào layer effects
        try {
            var layer = getLayer();
            if (layer && layer.kind == LayerKind.TEXT) {
                var rgb = layer.textItem.color.rgb;
                out.textColor = {
                    r: Math.round(rgb.red),
                    g: Math.round(rgb.green),
                    b: Math.round(rgb.blue)
                };
            }
        } catch(e) {}

        // Lấy layer effects (nếu có)
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc = executeActionGet(ref);
        var fxKey = stringIDToTypeID("layerEffects");
        if (desc.hasKey(fxKey)) {
            var fx = desc.getObjectValue(fxKey);

            // Gradient Fill
            try {
                if (fx.hasKey(stringIDToTypeID("gradientFill"))) {
                    var gf = fx.getObjectValue(stringIDToTypeID("gradientFill"));
                    var gradient = gf.getObjectValue(stringIDToTypeID("gradient"));
                    var colors = [];
                    if (gradient.hasKey(stringIDToTypeID("colors"))) {
                        var colorList = gradient.getList(stringIDToTypeID("colors"));
                        for (var i = 0; i < colorList.count; i++) {
                            var stop = colorList.getObjectValue(i);
                            colors.push(getColorFromDesc(stop.getObjectValue(stringIDToTypeID("color"))));
                        }
                    }
                    var gradType = "linear";
                    try { gradType = typeIDToStringID(gf.getEnumerationValue(stringIDToTypeID("type"))); } catch(e) {}
                    out.gradientFill = {
                        enabled: gf.getBoolean(stringIDToTypeID("enabled")),
                        angle: safeGetUnitDouble(gf, "angle"),
                        type: gradType,
                        colors: colors
                    };
                }
            } catch(e) {}

            // Stroke
            try {
                if (fx.hasKey(stringIDToTypeID("frameFX"))) {
                    var st = fx.getObjectValue(stringIDToTypeID("frameFX"));
                    out.strokes = [{
                        enabled: st.getBoolean(stringIDToTypeID("enabled")),
                        size: safeGetUnitDouble(st, "size"),
                        color: getColorFromDesc(st.getObjectValue(stringIDToTypeID("color")))
                    }];
                }
            } catch(e) {}

            // Outer Glow
            try {
                if (fx.hasKey(stringIDToTypeID("outerGlow"))) {
                    var og = fx.getObjectValue(stringIDToTypeID("outerGlow"));
                    out.outerGlow = {
                        enabled: og.getBoolean(stringIDToTypeID("enabled")),
                        opacity: safeGetUnitDouble(og, "opacity"),
                        blur: safeGetUnitDouble(og, "blur"),
                        chokeMatte: safeGetUnitDouble(og, "chokeMatte"),
                        color: getColorFromDesc(og.getObjectValue(stringIDToTypeID("color")))
                    };
                } else {
                    out.outerGlow = {
                        enabled: false,
                        opacity: 100,
                        blur: 20,
                        chokeMatte: 5,
                        color: { r: 255, g: 255, b: 255 }
                    };
                }
            } catch(e) {}
        } else {
            // Không có layer effects → vẫn cung cấp outerGlow mặc định
            out.outerGlow = {
                enabled: false,
                opacity: 100,
                blur: 20,
                chokeMatte: 5,
                color: { r: 255, g: 255, b: 255 }
            };
        }

        return JSON.stringify(out);
    } catch(e) { return "ERROR:" + e.message; }
}

function getForegroundColor() {
    try {
        var c = app.foregroundColor.rgb;
        return JSON.stringify({ r: Math.round(c.red), g: Math.round(c.green), b: Math.round(c.blue) });
    } catch(e) { return "ERROR:" + e.message; }
}
function getBackgroundColor() {
    try {
        var c = app.backgroundColor.rgb;
        return JSON.stringify({ r: Math.round(c.red), g: Math.round(c.green), b: Math.round(c.blue) });
    } catch(e) { return "ERROR:" + e.message; }
}

// Apply: ghi đè hoàn toàn (chỉ giữ những mục được bật)
function _applyFX(data) {
    var setDesc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    setDesc.putReference(charIDToTypeID("null"), ref);
    var effDesc = new ActionDescriptor();
    effDesc.putUnitDouble(stringIDToTypeID("scale"), stringIDToTypeID("percentUnit"), 100.0);

    // Gradient
    if (data.gradientFill && data.gradientFill.enabled) {
        var gf = createGradientDescriptor(data.gradientFill);
        effDesc.putObject(stringIDToTypeID("gradientFill"), stringIDToTypeID("gradientFill"), gf);
    }
    // Stroke
    if (data.strokes && data.strokes.length > 0) {
        for (var s = 0; s < data.strokes.length; s++) {
            var st = createStrokeDescriptor(data.strokes[s]);
            var keyStr = s === 0 ? "frameFX" : "frameFX" + (s + 1);
            effDesc.putObject(stringIDToTypeID(keyStr), stringIDToTypeID("frameFX"), st);
        }
    }
    // Outer Glow
    if (data.outerGlow && data.outerGlow.enabled) {
        var og = new ActionDescriptor();
        og.putBoolean(stringIDToTypeID("enabled"), true);
        og.putBoolean(stringIDToTypeID("present"), true);
        og.putBoolean(stringIDToTypeID("showInDialog"), true);
        og.putEnumerated(stringIDToTypeID("mode"), stringIDToTypeID("blendMode"), stringIDToTypeID("normal"));
        og.putUnitDouble(stringIDToTypeID("opacity"), stringIDToTypeID("percentUnit"), data.outerGlow.opacity || 100);
        og.putEnumerated(stringIDToTypeID("glowTechnique"), stringIDToTypeID("matteTechnique"), stringIDToTypeID("softMatte"));
        og.putUnitDouble(stringIDToTypeID("chokeMatte"), stringIDToTypeID("pixelsUnit"), data.outerGlow.chokeMatte || 0);
        og.putUnitDouble(stringIDToTypeID("blur"), stringIDToTypeID("pixelsUnit"), data.outerGlow.blur || 10);
        og.putUnitDouble(stringIDToTypeID("noise"), stringIDToTypeID("percentUnit"), 0);
        og.putBoolean(stringIDToTypeID("antiAlias"), false);
        og.putUnitDouble(stringIDToTypeID("inputRange"), stringIDToTypeID("percentUnit"), 50);
        var ogColor = new ActionDescriptor();
        ogColor.putDouble(stringIDToTypeID("red"), data.outerGlow.color.r);
        ogColor.putDouble(stringIDToTypeID("green"), data.outerGlow.color.g);
        ogColor.putDouble(stringIDToTypeID("blue"), data.outerGlow.color.b);
        og.putObject(stringIDToTypeID("color"), stringIDToTypeID("RGBColor"), ogColor);
        effDesc.putObject(stringIDToTypeID("outerGlow"), stringIDToTypeID("outerGlow"), og);
    }
    
// Áp dụng màu chữ (nếu có)
if (data.textColor) {
    try {
        var layer = getLayer();
        if (layer && layer.kind == LayerKind.TEXT) {
            var newColor = new SolidColor();
            newColor.rgb.red = data.textColor.r;
            newColor.rgb.green = data.textColor.g;
            newColor.rgb.blue = data.textColor.b;
            layer.textItem.color = newColor;
        }
    } catch(e) {}
}

    var layerDesc = new ActionDescriptor();
    layerDesc.putObject(stringIDToTypeID("layerEffects"), stringIDToTypeID("layerEffects"), effDesc);
    setDesc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), layerDesc);
    executeAction(charIDToTypeID("setd"), setDesc, DialogModes.NO);
    app.refresh();
    return "OK";
}

function applyFXFromJSON(jsonStr) {
    try {
        var data = (typeof jsonStr === "string") ? JSON.parse(jsonStr) : jsonStr;
        if (!data) return "NO_DATA";
        if (!app.documents.length) return "NO_DOC";
        var layer = getLayer();
        if (!layer) return "NO_LAYER";
        return _applyFX(data);
    } catch(e) { return "ERROR:" + e.message; }
}

// Lấy danh sách ID của các layer đang được chọn
function getSelectedLayersIDs() {
    var ids = [];
    try {
        var ref = new ActionReference();
        ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("targetLayersIDs"));
        ref.putEnumerated(stringIDToTypeID("document"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
        var desc = executeActionGet(ref);
        var list = desc.getList(stringIDToTypeID("targetLayersIDs"));
        for (var i = 0; i < list.count; i++) {
            ids.push(list.getReference(i).getIdentifier());
        }
    } catch(e) {
        // Fallback: nếu lỗi thì chỉ lấy active layer
        ids.push(app.activeDocument.activeLayer.id);
    }
    return ids;
}

// Áp dụng FX cho tất cả text layer đang được chọn


function applyFXToSelectedLayers(payloadStr) {
    try {
        if (!app.documents.length) return "NO_DOC";
        var doc = app.activeDocument;
        var originalLayer = doc.activeLayer;
        var selectedIds = getSelectedLayersIDs();
        if (selectedIds.length === 0) return "NO_LAYER";

        var payload;
        if (typeof payloadStr === "string") {
            payload = JSON.parse(payloadStr);
        } else {
            payload = payloadStr;
        }
        if (!payload) return "NO_DATA";

        // Single layer: apply thẳng
        if (selectedIds.length === 1) {
            selectLayerByID(selectedIds[0]);
            _applyFX(payload);
            selectLayerByID(originalLayer.id);
            return "OK";
        }

        // ===== NHIỀU LAYER =====
        // 1. Duplicate layer đầu tiên làm holder (có content, tránh lỗi empty layer)
        selectLayerByID(selectedIds[0]);
        var tempLayer = doc.activeLayer.duplicate(doc, ElementPlacement.PLACEATEND);
        tempLayer.name = "_typo_temp_fx";
        doc.activeLayer = tempLayer;

        // 2. Apply FX lên holder
        _applyFX(payload);
        doc.activeLayer = tempLayer;

        // 3. Tạo style tạm từ layer holder
        var styleName = "_typo_fx_" + Number(new Date());
        makeTempStyle(styleName);

        // 4. Restore selection rồi apply style 1 lần duy nhất
        selectLayersByIDs(selectedIds);
        applyTempStyle(styleName);

        // 5. Dọn dẹp
        doc.activeLayer = tempLayer;
        tempLayer.remove();
        deleteTempStyle(styleName);

        // 6. Set màu chữ riêng nếu có (style không chứa text color)
        if (payload.textColor) {
            for (var i = 0; i < selectedIds.length; i++) {
                selectLayerByID(selectedIds[i]);
                try {
                    if (doc.activeLayer.kind == LayerKind.TEXT) {
                        var nc = new SolidColor();
                        nc.rgb.red   = payload.textColor.r;
                        nc.rgb.green = payload.textColor.g;
                        nc.rgb.blue  = payload.textColor.b;
                        doc.activeLayer.textItem.color = nc;
                    }
                } catch(e) {}
            }
        }

        selectLayerByID(originalLayer.id);
        app.refresh();
        return "OK";
    } catch (e) {
        return "ERROR: " + e.toString();
    }
}

// Tạo style tạm từ layer đang active
// Dịch từ Alchemist: _obj:"make", _target:[{_ref:"style"}]
function makeTempStyle(name) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("style"));
    desc.putReference(charIDToTypeID("null"), ref);
    desc.putString(charIDToTypeID("Nm  "), name);
    // using: target layer hiện tại
    var fromRef = new ActionReference();
    fromRef.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
    );
    desc.putReference(stringIDToTypeID("using"), fromRef);
    desc.putBoolean(stringIDToTypeID("blendOptions"), false);
    desc.putBoolean(stringIDToTypeID("layerEffects"), true);
    desc.putBoolean(stringIDToTypeID("pushToDesignLibraries"), false);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
}

// Apply style lên selection hiện tại
// Dịch từ Alchemist: _obj:"applyStyle"
function applyTempStyle(name) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putName(stringIDToTypeID("style"), name);
    desc.putReference(charIDToTypeID("null"), ref);
    // to: target layer/selection hiện tại
    var toRef = new ActionReference();
    toRef.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
    );
    desc.putReference(stringIDToTypeID("to"), toRef);
    desc.putBoolean(stringIDToTypeID("group"), true);
    executeAction(stringIDToTypeID("applyStyle"), desc, DialogModes.NO);
}

// Xóa style tạm
function deleteTempStyle(name) {
    try {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putName(stringIDToTypeID("style"), name);
        desc.putReference(charIDToTypeID("null"), ref);
        executeAction(charIDToTypeID("Dlt "), desc, DialogModes.NO);
    } catch(e) {}
}

function getHotkeyPressed() {
    try {
        var e = ScriptUI.environment.keyboardState;
        // Dùng Ctrl + Shift + X (e.ctrlKey)
        if (e.ctrlKey && e.shiftKey && (e.key === "x" || e.key === "X")) {
            return "ctrlShiftX";
        }
        return "";
    } catch(e) {
        return "";
    }
}

// Restore multi-selection
function selectLayersByIDs(ids) {
    for (var i = 0; i < ids.length; i++) {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID("Lyr "), ids[i]);
        desc.putReference(charIDToTypeID("null"), ref);
        desc.putBoolean(stringIDToTypeID("makeVisible"), false);
        desc.putEnumerated(
            stringIDToTypeID("selectionModifier"),
            stringIDToTypeID("selectionModifierType"),
            i === 0
                ? stringIDToTypeID("replaceSelection")
                : stringIDToTypeID("addToSelection")
        );
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    }
}

// ========== COPY FX ==========
var _copiedFX = null;
var _copiedColor = null;

function getCurrentLayerEffects() {
    try {
        if (!app.documents.length) return null;
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc = executeActionGet(ref);
        var fxKey = stringIDToTypeID("layerEffects");
        if (desc.hasKey(fxKey)) {
            return desc.getObjectValue(fxKey);
        }
        return null;
    } catch(e) { return null; }
}

function copyFX() {
    if (!app.documents.length) return "NO_DOC";
    var fx = getCurrentLayerEffects();
    if (!fx) return "NO_FX";
    _copiedFX = fx;
    
    // Lưu màu chữ nếu là text layer
    var layer = getLayer();
    if (layer && layer.kind == LayerKind.TEXT) {
        try {
            var rgb = layer.textItem.color.rgb;
            _copiedColor = { r: Math.round(rgb.red), g: Math.round(rgb.green), b: Math.round(rgb.blue) };
        } catch(e) { _copiedColor = null; }
    } else {
        _copiedColor = null;
    }
    return "OK";
}
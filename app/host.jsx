#targetengine "session"
// ============================================================
//  TypoCore v3 — CEP Host Script
//  Photoshop 22+ (CC 2021+) / PS 25.x (2024)
// ============================================================

var memory = {};
var _typoCoreLoaded = true; // flag tránh load lại

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
        if (len % 2 == 1) {
            np[Math.floor(len / 2)] += extra;
        } else {
            var m1 = Math.floor(len / 2) - 1, m2 = Math.floor(len / 2);
            np[m1] += Math.floor(extra / 2);
            np[m2] += extra - Math.floor(extra / 2);
        }
    }

    var result = "", index = 0;
    for (var i = 0; i < np.length; i++) {
        var line = [];
        for (var j = 0; j < np[i]; j++) {
            if (words[index]) line.push(words[index++]);
        }
        result += line.join(" ");
        if (i < np.length - 1) result += "\r";
    }

    layer.textItem.contents = result;
    app.refresh();
    return "OK";
}

var data = {
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
    var words = splitWords(getText()), total = words.length;
    var base = Math.floor(total / lines), extra = total % lines;
    var pattern = [];
    for (var i = 0; i < lines; i++) pattern.push(base + (i < extra ? 1 : 0));
    return applyPattern(pattern);
}

function resizeBox() {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    try {
        var doc = app.activeDocument;
        var t = layer.textItem;
        var wasPoint = (t.kind == TextType.POINTTEXT);
        if (wasPoint) t.kind = TextType.PARAGRAPHTEXT;

        var dup = layer.duplicate();
        dup.visible = false;
        var dt = dup.textItem;
        dt.width  = new UnitValue(5000, "px");
        dt.height = new UnitValue(5000, "px");
        dup.rasterize(RasterizeType.ENTIRELAYER);

        var b  = dup.bounds;
        var rW = b[2].as("px") - b[0].as("px");
        var rH = b[3].as("px") - b[1].as("px");
        dup.remove();

        var padding = 20;
        t.width  = new UnitValue(rW + padding * 5, "px");
        t.height = new UnitValue(rH + padding + 200, "px");
        app.refresh();
        return "OK";
    } catch(e) {
        try { app.refresh(); } catch(e2) {}
        return "ERROR:" + e.message;
    }
}

function alignCenter() {
    var doc = app.activeDocument, layer = getLayer();
    if (!layer) return "NO_LAYER";
    try {
        var b  = doc.selection.bounds;
        var cx = (b[0].as("px") + b[2].as("px")) / 2;
        var cy = (b[1].as("px") + b[3].as("px")) / 2;
        var tb = layer.bounds;
        var tx = (tb[0].as("px") + tb[2].as("px")) / 2;
        var ty = (tb[1].as("px") + tb[3].as("px")) / 2;
        layer.translate(cx - tx, cy - ty);
        doc.selection.deselect();
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
    var result = _doApplySize(layer, dSize, dLead);
    app.refresh();
    return result;
}

var _copiedFX    = null;
var _copiedColor = null;

function copyFX() {
    if (!app.documents.length) return "NO_DOC";
    try {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var desc  = executeActionGet(ref);
        var fxKey = stringIDToTypeID("layerEffects");
        if (!desc.hasKey(fxKey)) return "NO_FX";
        _copiedFX = desc.getObjectValue(fxKey);

        _copiedColor = null;
        try {
            var layer = app.activeDocument.activeLayer;
            if (layer.kind == LayerKind.TEXT) {
                var c = layer.textItem.color.rgb;
                _copiedColor = { r: c.red, g: c.green, b: c.blue };
            }
        } catch(ec) {}

        return "OK";
    } catch(e) { return "ERROR:" + e.message; }
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
        for (var i = 0; i < list.count; i++)
            ids.push(list.getReference(i).getIdentifier());
    } catch(e) {
        ids.push(doc.activeLayer.id);
    }

    var srcFX = _copiedFX;
    for (var i = 0; i < ids.length; i++) {
        try {
            selectLayerByID(ids[i]);
            var layerRef = new ActionReference();
            layerRef.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var setDesc   = new ActionDescriptor();
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
    } catch(e) {
        return "NO_PATH";
    }
}

var LOGO_PATH = "";

function pickLogoPath() {
    try {
        var f = File.openDialog("Chọn file logo", "*.png;*.jpg;*.jpeg;*.tif;*.tiff;*.psd;*.ai;*.eps", false);
        if (!f) return "CANCELLED";
        LOGO_PATH = f.fsName.split("\\").join("/");
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

// ===================== NEW: Paste All Opened Images =====================
function pasteAllOpenedImages() {
    if (!app.documents.length) return "NO_DOC";
    var currentDoc = app.activeDocument;
    var otherDocs = [];
    for (var i = 0; i < app.documents.length; i++) {
        if (app.documents[i] != currentDoc) otherDocs.push(app.documents[i]);
    }
    if (!otherDocs.length) return "NO_OTHER_DOC";
    try {
        for (var d = 0; d < otherDocs.length; d++) {
            var f = otherDocs[d].fullName;
            if (!f || !f.exists) continue;
            var idPlc = charIDToTypeID("Plc ");
            var desc  = new ActionDescriptor();
            desc.putPath(charIDToTypeID("null"), f);
            desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
            executeAction(idPlc, desc, DialogModes.NO);
        }
        app.refresh();
        return "OK";
    } catch(e) { return "ERROR:" + e.message; }
}
// ========================================================================

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

// ===================== GET TEXT FONT =====================
function getTextFont() {
    var layer = getLayer();
    if (!layer) return "NO_LAYER";
    try {
        var font = layer.textItem.font;
        // Trả về tên hiển thị (nếu có), nếu không thì dùng postScriptName
        if (font && font.name) return font.name;
        if (font && font.postScriptName) return font.postScriptName;
        return "Arial"; // dự phòng
    } catch(e) {
        return "ERROR:" + e.message;
    }
}

// ===================== GET TEXT AND FONT =====================
function getTextAndFont() {
    var layer = getLayer();
    if (!layer) return JSON.stringify({ text: "", font: "", error: "NO_LAYER" });
    try {
        var text = layer.textItem.contents;
        var font = layer.textItem.font;
        return JSON.stringify({ text: text, font: font, error: null });
    } catch(e) {
        return JSON.stringify({ text: "", font: "", error: e.message });
    }
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


// ===================== UPDATED: Paste Logo to ALL Opened Docs =====================
function pasteLogoToAllDocs() {
    if (!app.documents.length) return "NO_DOC";
    if (!LOGO_PATH) return "NO_LOGO_SELECTED";

    var logoFile = new File(LOGO_PATH);
    if (!logoFile.exists) return "LOGO_FILE_NOT_FOUND";

    var originalDoc = app.activeDocument; // nhớ document gốc để quay lại sau

    try {
        // Duyệt qua TẤT CẢ các document đang mở (không loại trừ)
        for (var i = 0; i < app.documents.length; i++) {
            var doc = app.documents[i];
            app.activeDocument = doc; // kích hoạt document cần dán

            // Place logo
            var idPlc = charIDToTypeID("Plc ");
            var desc = new ActionDescriptor();
            desc.putPath(charIDToTypeID("null"), logoFile);
            desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
            executeAction(idPlc, desc, DialogModes.NO);

            // Định vị logo: sát trái, giữa dọc
            var logoLayer = doc.activeLayer;
            if (logoLayer) {
                var docW = doc.width.as("px");
                var docH = doc.height.as("px");
                var bounds = logoLayer.bounds;
                var layerW = bounds[2].as("px") - bounds[0].as("px");
                var layerH = bounds[3].as("px") - bounds[1].as("px");

                var newX = 0; // sát trái
                var newY = (docH - layerH) / 2; // giữa dọc

                var currentX = bounds[0].as("px");
                var currentY = bounds[1].as("px");
                logoLayer.translate(newX - currentX, newY - currentY);
            }
        }

        // Quay về document ban đầu (không bắt buộc nhưng giữ thói quen làm việc)
        app.activeDocument = originalDoc;
        app.refresh();
        return "OK";
    } catch(e) {
        try { app.activeDocument = originalDoc; } catch(e2) {}
        return "ERROR:" + e.message;
    }
}

// ===================== NOTIFIER SETUP =====================
var _typoCoreNotifier = null; // lưu notifier

function setupNotifier() {
    try {
        // Xóa notifier cũ nếu có
        if (_typoCoreNotifier) {
            app.notifiers.remove(_typoCoreNotifier);
            _typoCoreNotifier = null;
        }

        // Tạo notifier mới: lắng nghe sự kiện "select" (khi layer được chọn)
        _typoCoreNotifier = app.notifiers.add("select", function(event) {
            // Gọi hàm notifyPreview – hàm này sẽ được CEP gọi trực tiếp
            // Thực tế, notifier này chạy trong ExtendScript engine,
            // ta cần thông báo cho CEP bằng cách gửi một sự kiện (dispatch event)
            // hoặc gọi một hàm được định nghĩa trong CEP thông qua evalScript.
            // Tuy nhiên, notifier không thể trực tiếp gọi CEP nên ta phải dùng cách khác.
            // Sẽ được hướng dẫn sau.
        });

        return "OK";
    } catch(e) {
        return "ERROR:" + e.message;
    }
}

// ===================== NOTIFIER + DISPATCH =====================
var _typoCoreNotifier = null;

function setupNotifier() {
    try {
        if (_typoCoreNotifier) {
            app.notifiers.remove(_typoCoreNotifier);
            _typoCoreNotifier = null;
        }

        // Lắng nghe sự kiện "select" (khi layer được chọn)
        _typoCoreNotifier = app.notifiers.add("select", function(event) {
            // Bắn sự kiện sang CEP
            var csEvent = new CSXSEvent();
            csEvent.type = "typoCoreLayerChanged";
            csEvent.data = "";
            app.dispatchEvent(csEvent);
        });

        return "OK";
    } catch(e) {
        return "ERROR:" + e.message;
    }
}

function removeNotifier() {
    try {
        if (_typoCoreNotifier) {
            app.notifiers.remove(_typoCoreNotifier);
            _typoCoreNotifier = null;
        }
        return "OK";
    } catch(e) {
        return "ERROR:" + e.message;
    }
}

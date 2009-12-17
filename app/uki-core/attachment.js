include('const.js');
include('utils.js');
include('dom.js');
include('attr.js');
include('geometry.js');

(function() {
    var self = uki.Attachment = uki.newClass({
        init: function( dom, view, rect, options ) {
            uki.initNativeLayout();
            
            options = options || {};
            this._dom     = dom = dom || root;
            this._view    = view;
            this._innerRect = this._rect    = Rect.create(rect)            || new Rect(1000, 1000);
            this._maxSize = Size.create(options.maxSize) || new Size(50000, 50000);
            this._minSize = Size.create(options.minSize) || new Size(0, 0);
            
            view.parent(this);
            
            if (dom != root) {
                var computedStyle = dom.runtimeStyle || dom.ownerDocument.defaultView.getComputedStyle(dom, null);
                if (!computedStyle.position || computedStyle.position == 'static') dom.style.position = 'relative';
            }
            self.register(this);

            this.layout();
            this.layout(); // ff needs 2 of them o_O
        },
        
        domForChild: function() {
            return this._dom === root ? doc.body : this._dom;
        },
        
        rect: function() {
            return this._rect;
        },
        
        clientRect: function() {
            return this._rect;
        },
        
        parent: function() {
            return null;
        },
        
        layout: function() {
            var width = this._dom === root ? getRootElement().clientWidth : this._dom.offsetWidth,
                height = this._dom === root ? getRootElement().clientHeight : this._dom.offsetHeight,
                innerRect = new Rect(
                    Math.min(this._maxSize.width, Math.max(this._minSize.width,  width)), 
                    Math.min(this._maxSize.height, Math.max(this._minSize.height, height))
                ),
                oldRect = this._innerRect;
                
            // if (rect.eq(this._rect)) return;

            this._innerRect = innerRect;
            this._rect = new Rect(width, height);
            this._view.parentResized(oldRect, innerRect);
            if (this._view._needsLayout) this._view.layout(innerRect);
        },
        
        dom: function() {
            return this._dom;
        },
        
        view: function() {
            return this._view;
        }
    });
    
    function getRootElement() {
        return doc.compatMode == "CSS1Compat" && doc.documentElement || doc.body;
    }
    
    self.instances = [];
    
    self.register = function(a) {
        if (self.instances.length == 0) {
            uki.dom.bind(root, 'resize', function() {
                uki.each(self.instances, function() { this.layout(); });
            });
        }
        self.instances.push(a);
    };
    
    self.childViews = function() {
        return uki.map(self.instances, 'view');
    };
    
    uki.top = function() {
        return [self];
    };
})();

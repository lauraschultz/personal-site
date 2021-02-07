
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/pages/Home/Background.svelte generated by Svelte v3.29.7 */

    const file = "src/pages/Home/Background.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let g22;
    	let path0;
    	let g15;
    	let g14;
    	let mask;
    	let path1;
    	let g13;
    	let g12;
    	let g11;
    	let g10;
    	let g0;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let g9;
    	let g3;
    	let g1;
    	let path10;
    	let path11;
    	let path12;
    	let g2;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let g4;
    	let path17;
    	let path18;
    	let g5;
    	let path19;
    	let path20;
    	let g6;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;
    	let g7;
    	let path27;
    	let path28;
    	let path29;
    	let g8;
    	let path30;
    	let path31;
    	let path32;
    	let g21;
    	let g20;
    	let g19;
    	let g18;
    	let g16;
    	let path33;
    	let path34;
    	let path35;
    	let g17;
    	let path36;
    	let path37;
    	let path38;
    	let path39;
    	let path40;
    	let path41;
    	let path42;
    	let defs;
    	let clipPath0;
    	let rect0;
    	let clipPath1;
    	let rect1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g22 = svg_element("g");
    			path0 = svg_element("path");
    			g15 = svg_element("g");
    			g14 = svg_element("g");
    			mask = svg_element("mask");
    			path1 = svg_element("path");
    			g13 = svg_element("g");
    			g12 = svg_element("g");
    			g11 = svg_element("g");
    			g10 = svg_element("g");
    			g0 = svg_element("g");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			g9 = svg_element("g");
    			g3 = svg_element("g");
    			g1 = svg_element("g");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			g2 = svg_element("g");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			g4 = svg_element("g");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			g5 = svg_element("g");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			g6 = svg_element("g");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			g7 = svg_element("g");
    			path27 = svg_element("path");
    			path28 = svg_element("path");
    			path29 = svg_element("path");
    			g8 = svg_element("g");
    			path30 = svg_element("path");
    			path31 = svg_element("path");
    			path32 = svg_element("path");
    			g21 = svg_element("g");
    			g20 = svg_element("g");
    			g19 = svg_element("g");
    			g18 = svg_element("g");
    			g16 = svg_element("g");
    			path33 = svg_element("path");
    			path34 = svg_element("path");
    			path35 = svg_element("path");
    			g17 = svg_element("g");
    			path36 = svg_element("path");
    			path37 = svg_element("path");
    			path38 = svg_element("path");
    			path39 = svg_element("path");
    			path40 = svg_element("path");
    			path41 = svg_element("path");
    			path42 = svg_element("path");
    			defs = svg_element("defs");
    			clipPath0 = svg_element("clipPath");
    			rect0 = svg_element("rect");
    			clipPath1 = svg_element("clipPath");
    			rect1 = svg_element("rect");
    			attr_dev(path0, "id", "Vector 1");
    			attr_dev(path0, "d", "M0 0V1559.97C319.858 1742.93 801.245 1608.12 990.527 1338.5C1223.75 1006.28 828.221 802.349 1300.07 457.4C1609.61 231.107 2084.23 457.4 2466 0H0Z");
    			attr_dev(path0, "fill", "#1F3147");
    			add_location(path0, file, 8, 2, 130);
    			attr_dev(path1, "id", "Vector 1_2");
    			attr_dev(path1, "d", "M0 0V1559.97C319.858 1742.93 801.245 1608.12 990.527 1338.5C1223.75 1006.28 828.221 802.349 1300.07 457.4C1609.61 231.107 2084.23 457.4 2466 0H0Z");
    			attr_dev(path1, "fill", "white");
    			add_location(path1, file, 24, 5, 553);
    			attr_dev(mask, "id", "mask0");
    			attr_dev(mask, "mask-type", "alpha");
    			attr_dev(mask, "maskUnits", "userSpaceOnUse");
    			attr_dev(mask, "x", "0");
    			attr_dev(mask, "y", "0");
    			attr_dev(mask, "width", "2466");
    			attr_dev(mask, "height", "1644");
    			add_location(mask, file, 15, 4, 406);
    			attr_dev(path2, "id", "Vector");
    			attr_dev(path2, "d", "M474.71 1135.28C474.71 1140.58 476.817 1145.67 480.568 1149.42C484.319 1153.17 489.406 1155.28 494.71 1155.28H805.55C810.854 1155.28 815.941 1153.17 819.692 1149.42C823.443 1145.67 825.55 1140.58 825.55 1135.28C825.55 1129.98 823.443 1124.89 819.692 1121.14C815.941 1117.39 810.854 1115.28 805.55 1115.28H494.71C489.406 1115.28 484.319 1117.39 480.568 1121.14C476.817 1124.89 474.71 1129.98 474.71 1135.28Z");
    			attr_dev(path2, "fill", "white");
    			attr_dev(path2, "stroke", "#DDAB3C");
    			attr_dev(path2, "stroke-width", "5");
    			attr_dev(path2, "stroke-miterlimit", "10");
    			add_location(path2, file, 35, 9, 941);
    			attr_dev(path3, "id", "Vector_2");
    			attr_dev(path3, "d", "M585.89 1187.5H702.89C706.645 1187.5 710.247 1186.01 712.903 1183.35C715.558 1180.7 717.05 1177.1 717.05 1173.34V1155.28H571.74V1173.35C571.743 1177.1 573.234 1180.7 575.887 1183.35C578.54 1186.01 582.138 1187.5 585.89 1187.5V1187.5Z");
    			attr_dev(path3, "fill", "white");
    			attr_dev(path3, "stroke", "#DDAB3C");
    			attr_dev(path3, "stroke-width", "5");
    			attr_dev(path3, "stroke-miterlimit", "10");
    			add_location(path3, file, 43, 9, 1521);
    			attr_dev(path4, "id", "Vector_3");
    			attr_dev(path4, "d", "M659.72 1432.58H629.11V1187.5H659.72V1432.58Z");
    			attr_dev(path4, "fill", "white");
    			attr_dev(path4, "stroke", "#DDAB3C");
    			attr_dev(path4, "stroke-width", "5");
    			attr_dev(path4, "stroke-miterlimit", "10");
    			add_location(path4, file, 51, 9, 1930);
    			attr_dev(path5, "id", "Vector_4");
    			attr_dev(path5, "d", "M661.75 1495.8H627.06C620.3 1495.8 614.82 1490.32 614.82 1483.56V1444.82C614.82 1438.06 620.3 1432.58 627.06 1432.58H661.75C668.51 1432.58 673.99 1438.06 673.99 1444.82V1483.56C673.99 1490.32 668.51 1495.8 661.75 1495.8Z");
    			attr_dev(path5, "fill", "white");
    			attr_dev(path5, "stroke", "#DDAB3C");
    			attr_dev(path5, "stroke-width", "5");
    			attr_dev(path5, "stroke-miterlimit", "10");
    			add_location(path5, file, 59, 9, 2151);
    			attr_dev(path6, "id", "Vector_5");
    			attr_dev(path6, "d", "M508.94 1552.74C508.94 1537.64 514.939 1523.16 525.617 1512.48C536.296 1501.8 550.779 1495.8 565.88 1495.8H722.94C738.041 1495.8 752.524 1501.8 763.203 1512.48C773.881 1523.16 779.88 1537.64 779.88 1552.74");
    			attr_dev(path6, "stroke", "#DDAB3C");
    			attr_dev(path6, "stroke-width", "5");
    			attr_dev(path6, "stroke-miterlimit", "10");
    			add_location(path6, file, 67, 9, 2547);
    			attr_dev(path7, "id", "Vector_6");
    			attr_dev(path7, "d", "M507.91 1582.32C495.312 1582.32 485.1 1572.11 485.1 1559.51C485.1 1546.91 495.312 1536.7 507.91 1536.7C520.508 1536.7 530.72 1546.91 530.72 1559.51C530.72 1572.11 520.508 1582.32 507.91 1582.32Z");
    			attr_dev(path7, "fill", "white");
    			attr_dev(path7, "stroke", "#DDAB3C");
    			attr_dev(path7, "stroke-width", "5");
    			attr_dev(path7, "stroke-miterlimit", "10");
    			add_location(path7, file, 74, 9, 2905);
    			attr_dev(path8, "id", "Vector_7");
    			attr_dev(path8, "d", "M781.32 1582.32C768.722 1582.32 758.51 1572.11 758.51 1559.51C758.51 1546.91 768.722 1536.7 781.32 1536.7C793.918 1536.7 804.13 1546.91 804.13 1559.51C804.13 1572.11 793.918 1582.32 781.32 1582.32Z");
    			attr_dev(path8, "fill", "white");
    			attr_dev(path8, "stroke", "#DDAB3C");
    			attr_dev(path8, "stroke-width", "5");
    			attr_dev(path8, "stroke-miterlimit", "10");
    			add_location(path8, file, 82, 9, 3275);
    			attr_dev(path9, "id", "Vector_8");
    			attr_dev(path9, "d", "M643.59 1582.32C630.992 1582.32 620.78 1572.11 620.78 1559.51C620.78 1546.91 630.992 1536.7 643.59 1536.7C656.188 1536.7 666.4 1546.91 666.4 1559.51C666.4 1572.11 656.188 1582.32 643.59 1582.32Z");
    			attr_dev(path9, "fill", "white");
    			attr_dev(path9, "stroke", "#DDAB3C");
    			attr_dev(path9, "stroke-width", "5");
    			attr_dev(path9, "stroke-miterlimit", "10");
    			add_location(path9, file, 90, 9, 3648);
    			attr_dev(g0, "id", "CHAIR");
    			add_location(g0, file, 34, 8, 917);
    			attr_dev(path10, "id", "Vector_9");
    			attr_dev(path10, "d", "M940.94 1463.39C951.12 1487.54 960.39 1507.34 967.46 1520.33C972.72 1529.99 981.88 1586.33 1030.04 1563.63C1031.74 1562.83 1011.04 1557.49 1004.51 1510.88C1002.22 1494.54 1000.13 1478.78 998.22 1463.6C979.38 1464.88 955.48 1464.1 940.94 1463.39Z");
    			attr_dev(path10, "fill", "#FFCFC9");
    			add_location(path10, file, 102, 11, 4107);
    			attr_dev(path11, "id", "SHOE");
    			attr_dev(path11, "d", "M951.35 1586.33C951.35 1586.33 931.96 1519.23 957.89 1508.99C966.17 1505.72 976.21 1513.99 978.89 1542.23C981.24 1566.92 1017.31 1570.75 1020.71 1554.79C1020.71 1554.79 1064.93 1563.79 1064.93 1586.33H951.35Z");
    			attr_dev(path11, "fill", "#294C75");
    			add_location(path11, file, 107, 11, 4453);
    			attr_dev(path12, "id", "Vector_10");
    			attr_dev(path12, "d", "M927.85 1462.63C927.85 1462.63 981.41 1466.46 1009.58 1462.45C1009.58 1462.45 1046.98 1072.3 1041.39 1032.16C1034.66 983.87 873.9 941.07 790.79 927.5L775.48 858.16C775.48 858.16 663.04 856.16 599.55 856.16C599.55 856.16 531.55 977.16 538.55 1057.16C545.55 1137.16 692.17 1119 887.98 1119C887.98 1119 828.28 1239.51 927.85 1462.63Z");
    			attr_dev(path12, "fill", "#1E7B9F");
    			add_location(path12, file, 112, 11, 4758);
    			attr_dev(g1, "id", "LEFT LEG");
    			add_location(g1, file, 101, 10, 4078);
    			attr_dev(path13, "id", "Vector_11");
    			attr_dev(path13, "d", "M764.69 1465.29C779.587 1466.61 794.576 1466.49 809.45 1464.93C804.45 1484.38 799.83 1502.93 796.16 1519.5C793.79 1530.14 809.02 1544.5 813.36 1554.95L813.02 1554.79C793.02 1551.6 766.19 1570.54 768.95 1540.98C771.71 1511.42 767.47 1504.05 764.69 1465.29Z");
    			attr_dev(path13, "fill", "#FFCFC9");
    			add_location(path13, file, 119, 11, 5234);
    			attr_dev(path14, "id", "SHOE_2");
    			attr_dev(path14, "d", "M769.55 1519.23C762.67 1519.23 751.49 1531.67 752.6 1551.59C753.238 1563.48 755.7 1575.19 759.9 1586.33H837.23C835.87 1564.88 813.02 1554.79 813.02 1554.79C793.02 1551.6 767.19 1570.54 769.95 1540.98L769.55 1519.23Z");
    			attr_dev(path14, "fill", "#294C75");
    			add_location(path14, file, 124, 11, 5591);
    			attr_dev(path15, "id", "Vector_12");
    			attr_dev(path15, "d", "M709.01 965C709.01 965 879.44 995.8 898.8 1046.85C918.16 1097.9 827.85 1462.6 827.85 1462.6C775.49 1470.6 748.63 1462.6 748.63 1462.6C694.17 1212.84 757.98 1130 757.98 1130C631.07 1124.61 550.98 1136.65 538.54 1057.22C534.57 1032 562.93 935.53 709.01 965Z");
    			attr_dev(path15, "fill", "#1E7B9F");
    			add_location(path15, file, 129, 11, 5905);
    			attr_dev(path16, "id", "Vector_13");
    			attr_dev(path16, "d", "M712.01 965C712.01 965 882.44 995.8 901.8 1046.85C921.16 1097.9 830.85 1462.6 830.85 1462.6");
    			attr_dev(path16, "stroke", "#1F3147");
    			attr_dev(path16, "stroke-width", "5");
    			attr_dev(path16, "stroke-miterlimit", "10");
    			add_location(path16, file, 134, 11, 6262);
    			attr_dev(g2, "id", "RIGHT LEG");
    			add_location(g2, file, 118, 10, 5204);
    			attr_dev(g3, "id", "LEGS");
    			add_location(g3, file, 100, 9, 4054);
    			attr_dev(path17, "id", "Vector_14");
    			attr_dev(path17, "d", "M749.48 801.58C739.35 778.68 784.32 748.58 830.34 760.58C830.34 760.58 814.82 575.9 778.45 552.63C743.15 530.05 734.65 636.4 733.45 662.37C733.49 662.37 726.96 762.84 749.48 801.58Z");
    			attr_dev(path17, "fill", "#DBEAF0");
    			add_location(path17, file, 144, 10, 6577);
    			attr_dev(path18, "id", "Vector_15");
    			attr_dev(path18, "d", "M753.44 807.15C731.15 787.15 777.24 746.45 830.34 760.58C863.56 765.74 992.7 793.27 1004.84 799.58C1016.7 804.87 1050.95 822.1 1055.31 827.33C1060.81 833.93 1061.65 851.39 1061.31 853.69C1060.97 855.99 1056.46 867.96 1056.46 867.96C1056.46 867.96 1047.81 867.07 1048.91 857.66C1050.23 846.47 1040.27 843 1033.61 840C1030.83 838.76 1023.61 839.27 1022.34 843.48C1021.07 847.69 1031.6 852.79 1033.34 855.84C1035.93 860.46 1032.93 865.63 1032.87 865.74C1032.81 865.85 1016.81 857.12 1013.72 855.48C1010.88 853.97 997.53 838.39 991.87 824.66C991.83 824.65 792.57 842.31 753.44 807.15Z");
    			attr_dev(path18, "fill", "#FFC0B7");
    			add_location(path18, file, 149, 10, 6855);
    			attr_dev(g4, "id", "LEFT HAND");
    			add_location(g4, file, 143, 9, 6548);
    			attr_dev(path19, "id", "Vector_16");
    			attr_dev(path19, "d", "M778.17 453.26C781.92 444.15 797.46 397.01 772.28 376.65C747.1 356.29 713.89 335.4 673.71 338.65C633.53 341.9 624 387 599.56 404C578 418.997 566.25 414.9 540 438.5C513.75 462.1 523.76 486.75 497.01 506.58C470.26 526.41 456.3 512.96 429.5 548C398.78 588.18 421.705 617.59 381.5 643.5C336.5 672.5 324 711 331.61 767.22H582.79C743.17 742.44 778.17 453.26 778.17 453.26Z");
    			attr_dev(path19, "fill", "#DDAB3C");
    			add_location(path19, file, 156, 10, 7569);
    			attr_dev(path20, "id", "Vector_17");
    			attr_dev(path20, "d", "M760.86 373.83C736.38 352.14 707.92 337.71 667.66 339.68C627.4 341.65 613.5 378 588.88 394.54C569 407.896 556.53 403.69 529.5 427C502.47 450.31 508.76 479.26 481.31 498.69C453.86 518.12 444.46 507.97 416.5 543C384.43 583.17 406.085 602.128 368 634.5C328 668.5 307.5 706 313 767.5");
    			attr_dev(path20, "stroke", "#DDAB3C");
    			attr_dev(path20, "stroke-width", "5");
    			attr_dev(path20, "stroke-miterlimit", "10");
    			add_location(path20, file, 161, 10, 8032);
    			attr_dev(g5, "id", "HAIR");
    			add_location(g5, file, 155, 9, 7545);
    			attr_dev(path21, "id", "Vector_18");
    			attr_dev(path21, "d", "M776.24 857.46C776.24 857.46 790.48 741.4 798.01 735.32C814.92 721.66 828.37 702.07 821.32 675.02C817.32 659.75 785.17 558.53 778.32 552.1C771.47 545.67 726.52 529.6 726.52 529.6H599.52C585.06 534.42 539.66 550.75 528.81 567.37C475.81 648.53 458.86 778.71 458.86 778.71H524.76C524.76 778.71 556.48 707.52 567.76 706.71C579.04 705.9 600.17 856.46 600.17 856.46C600.17 856.46 672.42 876.51 776.24 857.46Z");
    			attr_dev(path21, "fill", "#DBEAF0");
    			add_location(path21, file, 170, 10, 8511);
    			attr_dev(path22, "id", "Vector_19");
    			attr_dev(path22, "d", "M777.24 857.46C777.24 857.46 791.48 741.4 799.01 735.32C815.92 721.66 830.37 701.07 823.32 674.02");
    			attr_dev(path22, "stroke", "#1F3147");
    			attr_dev(path22, "stroke-width", "5");
    			attr_dev(path22, "stroke-miterlimit", "10");
    			add_location(path22, file, 175, 10, 9010);
    			attr_dev(path23, "id", "Vector_20");
    			attr_dev(path23, "d", "M687.17 543.7C687.17 543.7 745.67 655.32 731.17 867.46");
    			attr_dev(path23, "stroke", "white");
    			attr_dev(path23, "stroke-width", "5");
    			attr_dev(path23, "stroke-miterlimit", "10");
    			add_location(path23, file, 182, 10, 9268);
    			attr_dev(path24, "id", "Vector_21");
    			attr_dev(path24, "d", "M694.16 638.2C689.902 638.2 686.45 634.748 686.45 630.49C686.45 626.232 689.902 622.78 694.16 622.78C698.418 622.78 701.87 626.232 701.87 630.49C701.87 634.748 698.418 638.2 694.16 638.2Z");
    			attr_dev(path24, "stroke", "white");
    			attr_dev(path24, "stroke-width", "5");
    			attr_dev(path24, "stroke-miterlimit", "10");
    			add_location(path24, file, 189, 10, 9481);
    			attr_dev(path25, "id", "Vector_22");
    			attr_dev(path25, "d", "M704.73 694.74C700.472 694.74 697.02 691.288 697.02 687.03C697.02 682.772 700.472 679.32 704.73 679.32C708.988 679.32 712.44 682.772 712.44 687.03C712.44 691.288 708.988 694.74 704.73 694.74Z");
    			attr_dev(path25, "stroke", "white");
    			attr_dev(path25, "stroke-width", "5");
    			attr_dev(path25, "stroke-miterlimit", "10");
    			add_location(path25, file, 196, 10, 9827);
    			attr_dev(path26, "id", "Vector_23");
    			attr_dev(path26, "d", "M710.38 751.48C706.122 751.48 702.67 748.028 702.67 743.77C702.67 739.512 706.122 736.06 710.38 736.06C714.638 736.06 718.09 739.512 718.09 743.77C718.09 748.028 714.638 751.48 710.38 751.48Z");
    			attr_dev(path26, "stroke", "white");
    			attr_dev(path26, "stroke-width", "5");
    			attr_dev(path26, "stroke-miterlimit", "10");
    			add_location(path26, file, 203, 10, 10177);
    			attr_dev(g6, "id", "BLOUSE");
    			add_location(g6, file, 169, 9, 8485);
    			attr_dev(path27, "id", "Vector_24");
    			attr_dev(path27, "d", "M466.17 810.36C498.8 844.67 709.76 798.79 709.76 798.79C709.76 798.79 720.76 816.17 733.64 816.79C746.52 817.41 758.71 812.86 765.25 818.38C771.79 823.9 778.39 833.51 783.51 834.5C789.589 835.743 795.828 836.007 801.99 835.28C799.802 829.247 797.285 823.338 794.45 817.58C798.34 820.73 803.17 826.51 806 828.92C807.178 830.016 808.69 830.684 810.294 830.816C811.897 830.948 813.498 830.538 814.84 829.65C814.84 829.65 806.39 816.75 803.06 813.3C799.73 809.85 789.52 801.19 783.86 799.22C777.17 796.36 738 777.17 718.45 773.99C697.72 770.63 529.84 759.33 529.84 759.33C469.12 759.29 438.77 781.56 466.17 810.36Z");
    			attr_dev(path27, "fill", "#FFCFC9");
    			add_location(path27, file, 212, 10, 10566);
    			attr_dev(path28, "id", "Vector_25");
    			attr_dev(path28, "d", "M795.68 833.27C795.68 833.27 783.56 812.2 779.5 809.97C772.35 806.03 763.02 800.85 763.02 800.85");
    			attr_dev(path28, "stroke", "#FFB0AF");
    			attr_dev(path28, "stroke-width", "3");
    			attr_dev(path28, "stroke-miterlimit", "10");
    			attr_dev(path28, "stroke-linecap", "round");
    			add_location(path28, file, 217, 10, 11273);
    			attr_dev(path29, "id", "Vector_26");
    			attr_dev(path29, "d", "M787.3 832.89C787.3 832.89 776.59 815.56 772.53 813.33C765.38 809.39 756.05 804.21 756.05 804.21");
    			attr_dev(path29, "stroke", "#FFB0AF");
    			attr_dev(path29, "stroke-width", "3");
    			attr_dev(path29, "stroke-miterlimit", "10");
    			attr_dev(path29, "stroke-linecap", "round");
    			add_location(path29, file, 225, 10, 11564);
    			attr_dev(g7, "id", "R_HAND");
    			attr_dev(g7, "class", "svelte-11sdxdm");
    			add_location(g7, file, 211, 9, 10540);
    			attr_dev(path30, "id", "Vector_27");
    			attr_dev(path30, "d", "M675.09 451.69C675.09 451.69 657.42 507.1 599.56 529.6C599.56 529.6 680.72 564.96 726.56 529.6V453.29L675.09 451.69Z");
    			attr_dev(path30, "fill", "#FFCFC9");
    			add_location(path30, file, 235, 10, 11892);
    			attr_dev(path31, "id", "Vector_28");
    			attr_dev(path31, "d", "M714.84 536.81C718.972 534.816 722.886 532.4 726.52 529.6V453.29L675.09 451.69C675.09 451.69 674.59 453.25 673.49 455.96C668.24 479.35 682.44 527.88 714.84 536.81Z");
    			attr_dev(path31, "fill", "#FFC0B7");
    			add_location(path31, file, 240, 10, 12105);
    			attr_dev(g8, "id", "NECK");
    			add_location(g8, file, 234, 9, 11868);
    			attr_dev(path32, "id", "HEAD");
    			attr_dev(path32, "d", "M676.44 460.22C676.97 478.44 711.26 521.3 730.01 521.3C745.55 521.3 774.56 474.43 778.22 453.3C781.97 431.56 778.17 393 747.17 392.46C728.01 392.13 718.17 410.13 712.42 431C705.42 456.19 683.94 450.54 683.94 450.54C683.94 450.54 677.79 436.54 669.22 443.54C660.65 450.54 676.44 460.22 676.44 460.22Z");
    			attr_dev(path32, "fill", "#FFCFC9");
    			add_location(path32, file, 246, 9, 12378);
    			attr_dev(g9, "id", "WOMAN");
    			add_location(g9, file, 99, 8, 4030);
    			attr_dev(g10, "id", "2");
    			add_location(g10, file, 33, 7, 898);
    			attr_dev(g11, "id", "Ð¡Ð»Ð¾Ð¹ 1");
    			add_location(g11, file, 32, 6, 831);
    			attr_dev(g12, "id", "Layer 2");
    			add_location(g12, file, 31, 5, 808);
    			attr_dev(g13, "mask", "url(#mask0)");
    			add_location(g13, file, 30, 4, 780);
    			attr_dev(g14, "id", "Mask Group");
    			add_location(g14, file, 14, 3, 382);
    			attr_dev(g15, "id", "character 14 2");
    			attr_dev(g15, "clip-path", "url(#clip0)");
    			add_location(g15, file, 13, 2, 331);
    			attr_dev(path33, "id", "Vector_29");
    			attr_dev(path33, "d", "M1174.55 1586.33L1124.55 897.5L1074.55 1587.78");
    			attr_dev(path33, "stroke", "#DDAB3C");
    			attr_dev(path33, "stroke-width", "5");
    			attr_dev(path33, "stroke-miterlimit", "10");
    			add_location(path33, file, 263, 7, 13009);
    			attr_dev(path34, "id", "Vector_30");
    			attr_dev(path34, "d", "M1178.94 897.5H520.61C516.497 897.5 512.553 895.868 509.643 892.961C506.733 890.055 505.095 886.113 505.09 882C505.09 877.884 506.725 873.936 509.636 871.026C512.546 868.115 516.494 866.48 520.61 866.48H1178.94V897.5Z");
    			attr_dev(path34, "fill", "white");
    			add_location(path34, file, 270, 7, 13195);
    			attr_dev(path35, "id", "Vector_31");
    			attr_dev(path35, "d", "M1178.94 897.5H520.61C516.497 897.5 512.553 895.868 509.643 892.961C506.733 890.055 505.095 886.113 505.09 882V882C505.09 877.884 506.725 873.936 509.636 871.026C512.546 868.115 516.494 866.48 520.61 866.48H1178.94");
    			attr_dev(path35, "stroke", "#DDAB3C");
    			attr_dev(path35, "stroke-width", "5");
    			attr_dev(path35, "stroke-miterlimit", "10");
    			add_location(path35, file, 275, 7, 13492);
    			attr_dev(g16, "id", "TABLE");
    			add_location(g16, file, 262, 6, 12987);
    			attr_dev(path36, "id", "Vector_32");
    			attr_dev(path36, "d", "M918.17 632.32H1183.84C1186.77 632.322 1189.65 633.031 1192.25 634.387C1194.84 635.742 1197.07 637.703 1198.74 640.104C1200.42 642.505 1201.49 645.275 1201.86 648.178C1202.24 651.081 1201.91 654.032 1200.9 656.78L1133.9 838.78H822.8L892.1 650.51C894.062 645.175 897.614 640.57 902.276 637.318C906.938 634.065 912.485 632.32 918.17 632.32V632.32Z");
    			attr_dev(path36, "stroke", "black");
    			attr_dev(path36, "stroke-miterlimit", "10");
    			add_location(path36, file, 284, 7, 13879);
    			attr_dev(path37, "id", "Vector_33");
    			attr_dev(path37, "d", "M915.78 632.32H1182.43C1194.76 632.32 1203.32 645.39 1199.06 657.72L1141.06 826.13C1139.9 829.75 1137.64 832.917 1134.59 835.186C1131.54 837.455 1127.86 838.712 1124.06 838.78H825.78L890.35 651.22C894.27 639.86 904.42 632.32 915.78 632.32Z");
    			attr_dev(path37, "fill", "white");
    			add_location(path37, file, 290, 7, 14337);
    			attr_dev(path38, "id", "Vector_34");
    			attr_dev(path38, "d", "M926.78 644.93H1193.43C1196.29 644.929 1199.1 645.619 1201.63 646.939C1204.16 648.26 1206.34 650.173 1207.97 652.515C1209.6 654.857 1210.65 657.559 1211.01 660.391C1211.37 663.223 1211.05 666.101 1210.06 668.78L1152.06 826.9C1150.78 830.383 1148.47 833.39 1145.43 835.514C1142.39 837.639 1138.77 838.779 1135.06 838.78H836.78L901.35 662.67C903.265 657.467 906.73 652.976 911.277 649.804C915.824 646.632 921.235 644.93 926.78 644.93Z");
    			attr_dev(path38, "fill", "#DCE4EA");
    			add_location(path38, file, 295, 7, 14656);
    			attr_dev(path39, "id", "Vector_35");
    			attr_dev(path39, "d", "M1134.52 838.78H625.66C618.565 838.78 611.761 841.598 606.745 846.615C601.728 851.631 598.91 858.435 598.91 865.53H1107.77C1114.86 865.53 1121.67 862.712 1126.69 857.695C1131.7 852.679 1134.52 845.875 1134.52 838.78Z");
    			attr_dev(path39, "fill", "white");
    			attr_dev(path39, "stroke", "#4A5568");
    			attr_dev(path39, "stroke-width", "6");
    			attr_dev(path39, "stroke-miterlimit", "10");
    			add_location(path39, file, 300, 7, 15170);
    			attr_dev(path40, "id", "Vector_36");
    			attr_dev(path40, "d", "M918.17 632.32H1183.84C1186.77 632.322 1189.65 633.031 1192.25 634.387C1194.84 635.742 1197.07 637.703 1198.74 640.104C1200.42 642.505 1201.49 645.275 1201.86 648.178C1202.24 651.081 1201.91 654.032 1200.9 656.78L1133.9 838.78H822.8L892.1 650.51C894.062 645.175 897.614 640.57 902.276 637.318C906.938 634.065 912.485 632.32 918.17 632.32V632.32Z");
    			attr_dev(path40, "stroke", "#4A5568");
    			attr_dev(path40, "stroke-width", "5");
    			attr_dev(path40, "stroke-miterlimit", "10");
    			add_location(path40, file, 308, 7, 15547);
    			attr_dev(path41, "id", "Vector_37");
    			attr_dev(path41, "d", "M1015.96 764.462C1009.67 757.472 1011.56 745.512 1020.18 737.747C1028.8 729.983 1040.9 729.355 1047.19 736.345C1053.48 743.334 1051.59 755.295 1042.97 763.059C1034.35 770.823 1022.26 771.451 1015.96 764.462Z");
    			attr_dev(path41, "fill", "#DDAB3C");
    			add_location(path41, file, 315, 7, 16032);
    			attr_dev(path42, "id", "Vector_38");
    			attr_dev(path42, "d", "M1009.85 758.095C1003.56 751.106 1005.45 739.145 1014.07 731.381C1022.69 723.617 1034.78 722.989 1041.08 729.978C1047.37 736.968 1045.48 748.928 1036.86 756.693C1028.24 764.457 1016.14 765.085 1009.85 758.095Z");
    			attr_dev(path42, "stroke", "#4A5568");
    			attr_dev(path42, "stroke-width", "5");
    			attr_dev(path42, "stroke-miterlimit", "10");
    			add_location(path42, file, 320, 7, 16321);
    			attr_dev(g17, "id", "LAPTOP");
    			add_location(g17, file, 283, 6, 13856);
    			attr_dev(g18, "id", "2_2");
    			add_location(g18, file, 261, 5, 12968);
    			attr_dev(g19, "id", "Ð¡Ð»Ð¾Ð¹ 1_2");
    			add_location(g19, file, 260, 4, 12901);
    			attr_dev(g20, "id", "Layer 2_2");
    			add_location(g20, file, 259, 3, 12878);
    			attr_dev(g21, "id", "character 14 1");
    			attr_dev(g21, "clip-path", "url(#clip1)");
    			add_location(g21, file, 258, 2, 12827);
    			attr_dev(g22, "id", "Group 1");
    			add_location(g22, file, 7, 1, 111);
    			attr_dev(rect0, "width", "909.17");
    			attr_dev(rect0, "height", "1250.96");
    			attr_dev(rect0, "fill", "white");
    			attr_dev(rect0, "transform", "matrix(-1 0 0 1 1211.17 337)");
    			add_location(rect0, file, 335, 3, 16749);
    			attr_dev(clipPath0, "id", "clip0");
    			add_location(clipPath0, file, 334, 2, 16724);
    			attr_dev(rect1, "width", "909.17");
    			attr_dev(rect1, "height", "1250.96");
    			attr_dev(rect1, "fill", "white");
    			attr_dev(rect1, "transform", "matrix(-1 0 0 1 1211.17 337)");
    			add_location(rect1, file, 343, 3, 16904);
    			attr_dev(clipPath1, "id", "clip1");
    			add_location(clipPath1, file, 342, 2, 16879);
    			add_location(defs, file, 333, 1, 16715);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 2466 1644");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g22);
    			append_dev(g22, path0);
    			append_dev(g22, g15);
    			append_dev(g15, g14);
    			append_dev(g14, mask);
    			append_dev(mask, path1);
    			append_dev(g14, g13);
    			append_dev(g13, g12);
    			append_dev(g12, g11);
    			append_dev(g11, g10);
    			append_dev(g10, g0);
    			append_dev(g0, path2);
    			append_dev(g0, path3);
    			append_dev(g0, path4);
    			append_dev(g0, path5);
    			append_dev(g0, path6);
    			append_dev(g0, path7);
    			append_dev(g0, path8);
    			append_dev(g0, path9);
    			append_dev(g10, g9);
    			append_dev(g9, g3);
    			append_dev(g3, g1);
    			append_dev(g1, path10);
    			append_dev(g1, path11);
    			append_dev(g1, path12);
    			append_dev(g3, g2);
    			append_dev(g2, path13);
    			append_dev(g2, path14);
    			append_dev(g2, path15);
    			append_dev(g2, path16);
    			append_dev(g9, g4);
    			append_dev(g4, path17);
    			append_dev(g4, path18);
    			append_dev(g9, g5);
    			append_dev(g5, path19);
    			append_dev(g5, path20);
    			append_dev(g9, g6);
    			append_dev(g6, path21);
    			append_dev(g6, path22);
    			append_dev(g6, path23);
    			append_dev(g6, path24);
    			append_dev(g6, path25);
    			append_dev(g6, path26);
    			append_dev(g9, g7);
    			append_dev(g7, path27);
    			append_dev(g7, path28);
    			append_dev(g7, path29);
    			append_dev(g9, g8);
    			append_dev(g8, path30);
    			append_dev(g8, path31);
    			append_dev(g9, path32);
    			append_dev(g22, g21);
    			append_dev(g21, g20);
    			append_dev(g20, g19);
    			append_dev(g19, g18);
    			append_dev(g18, g16);
    			append_dev(g16, path33);
    			append_dev(g16, path34);
    			append_dev(g16, path35);
    			append_dev(g18, g17);
    			append_dev(g17, path36);
    			append_dev(g17, path37);
    			append_dev(g17, path38);
    			append_dev(g17, path39);
    			append_dev(g17, path40);
    			append_dev(g17, path41);
    			append_dev(g17, path42);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath0);
    			append_dev(clipPath0, rect0);
    			append_dev(defs, clipPath1);
    			append_dev(clipPath1, rect1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Background", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/pages/Home/Home.svelte generated by Svelte v3.29.7 */
    const file$1 = "src/pages/Home/Home.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div0;
    	let background;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let p;
    	let t3;
    	let a0;
    	let t4;
    	let i0;
    	let t5;
    	let div2;
    	let a1;
    	let i1;
    	let current;
    	background = new Background({ $$inline: true });

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(background.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Hey, I'm Laura.";
    			t2 = space();
    			p = element("p");
    			t3 = space();
    			a0 = element("a");
    			t4 = text("Contact me\n\t\t\t");
    			i0 = element("i");
    			t5 = space();
    			div2 = element("div");
    			a1 = element("a");
    			i1 = element("i");
    			attr_dev(div0, "class", "flex-1 relative lg:absolute z-0 top-0 left-0 pointer-events-none max-w-screen-xl w-140p sm:w-120p md:w-105p lg:w-full xl:w-5/6");
    			add_location(div0, file$1, 9, 1, 252);
    			attr_dev(h1, "class", "text-3xl font-display mb-2");
    			add_location(h1, file$1, 15, 2, 488);
    			attr_dev(p, "class", "text-lg leading-tight");
    			add_location(p, file$1, 16, 2, 550);
    			attr_dev(i0, "class", "fas fa-arrow-right ml-1 group-hover:ml-2 transition-spacing duration-300");
    			add_location(i0, file$1, 24, 3, 790);
    			attr_dev(a0, "class", "px-5 py-2 bg-blue-800 text-gray-50 inline-block shadow rounded-lg my-4 group hover:pr-4 transition-spacing duration-300 text-lg");
    			attr_dev(a0, "href", "#contact");
    			add_location(a0, file$1, 19, 2, 608);
    			attr_dev(div1, "class", "flex-initial max-w-md z-20 m-8 md:m-12 text-dark");
    			add_location(div1, file$1, 14, 1, 423);
    			attr_dev(i1, "class", " fas fa-chevron-down");
    			attr_dev(i1, "size", "2x");
    			attr_dev(i1, "aria-label", "scroll to Projects");
    			add_location(i1, file$1, 33, 4, 1036);
    			attr_dev(a1, "href", "#projects");
    			add_location(a1, file$1, 32, 2, 1012);
    			attr_dev(div2, "class", "flex-initial mx-auto animate-bounce my-4 lg:absolute lg:bottom-0 lg:w-screen lg:text-center");
    			add_location(div2, file$1, 29, 1, 900);
    			attr_dev(section, "class", "section w-screen min-h-screen flex flex-col lg:flex-row items-start lg:items-center justify-center md:justify-end p-0 mx-auto max-w-7xl");
    			attr_dev(section, "id", "home");
    			add_location(section, file$1, 5, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(background, div0, null);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			p.innerHTML = /*bio*/ ctx[0];
    			append_dev(div1, t3);
    			append_dev(div1, a0);
    			append_dev(a0, t4);
    			append_dev(a0, i0);
    			append_dev(section, t5);
    			append_dev(section, div2);
    			append_dev(div2, a1);
    			append_dev(a1, i1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*bio*/ 1) p.innerHTML = /*bio*/ ctx[0];		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(background);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	let { bio } = $$props;
    	const writable_props = ["bio"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("bio" in $$props) $$invalidate(0, bio = $$props.bio);
    	};

    	$$self.$capture_state = () => ({ Background, bio });

    	$$self.$inject_state = $$props => {
    		if ("bio" in $$props) $$invalidate(0, bio = $$props.bio);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [bio];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { bio: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*bio*/ ctx[0] === undefined && !("bio" in props)) {
    			console.warn("<Home> was created without expected prop 'bio'");
    		}
    	}

    	get bio() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bio(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/dividers/Divider1.svelte generated by Svelte v3.29.7 */

    const file$2 = "src/shared/dividers/Divider1.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let path;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M598 0.499969H0C75.5 22 177.308 36 285 36C365.5 36 499.5 23 598 0.499969Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$2, 13, 1, 229);
    			attr_dev(svg, "class", svg_class_value = "w-screen max-h-24 h-8 md:h-auto " + /*color*/ ctx[0]);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "viewBox", "0 0.5 598 36");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$2, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1 && svg_class_value !== (svg_class_value = "w-screen max-h-24 h-8 md:h-auto " + /*color*/ ctx[0])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider1", slots, []);
    	let { color } = $$props;
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider1> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color];
    }

    class Divider1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider1",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[0] === undefined && !("color" in props)) {
    			console.warn("<Divider1> was created without expected prop 'color'");
    		}
    	}

    	get color() {
    		throw new Error("<Divider1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Divider1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.29.7 */

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    /* src/shared/logos/ChewLogo.svelte generated by Svelte v3.29.7 */

    const file$3 = "src/shared/logos/ChewLogo.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M6.62279 5.26215C6.20688 5.26215 5.8064 5.29259 5.42079 5.35155C5.81444 5.45269 6.08901 5.80199 6.08897 6.20162C6.08899 6.68072 5.6982 7.07151 5.21047 7.08012C5.21347 7.11829 5.21502 7.15656 5.21512 7.19484C5.21518 8.02423 4.54998 8.69659 3.72942 8.69656C3.42816 8.6965 3.13404 8.60386 2.88607 8.43094C2.73926 8.74032 2.42331 8.93819 2.07578 8.93841C1.62784 8.93851 1.24887 8.61321 1.18901 8.17721C0.974565 8.54479 0.795046 8.9399 0.652093 9.36009L0.650027 9.36215V9.36577C0.38128 10.172 0.249535 11.0402 0.249535 11.9615C0.249535 12.9812 0.394814 13.9176 0.70067 14.7587L0.702736 14.7623L0.704803 14.7665C1.01191 15.5799 1.43294 16.2922 1.97036 16.8816L1.97242 16.8837L1.97449 16.8857C2.51672 17.471 3.16165 17.9276 3.88858 18.2391L3.8922 18.2412H3.89426C4.6191 18.5432 5.39765 18.6944 6.20471 18.6944C6.64815 18.6944 7.0941 18.662 7.54262 18.5967C8.00756 18.5291 8.4582 18.4148 8.89241 18.2531L8.89654 18.251L8.90016 18.2489C9.34444 18.0781 9.7703 17.8571 10.1755 17.587L10.1817 17.5828L10.1854 17.5808C10.6043 17.2927 10.9884 16.9425 11.3357 16.5359L11.7362 16.0672L10.5528 14.567L10.5915 14.6218C10.3537 14.2571 9.87261 14.0223 9.45517 14.0223C9.1205 14.0223 8.77951 14.148 8.52138 14.3505C8.40004 14.4449 8.24846 14.5568 8.07386 14.6828C7.94534 14.7702 7.75927 14.8696 7.52351 14.9659C7.52316 14.9661 7.52184 14.9658 7.52144 14.9659C7.37921 15.0209 7.10838 15.0729 6.72459 15.0729C6.37618 15.0729 6.0947 15.0102 5.85126 14.8972C5.60558 14.7759 5.40286 14.6097 5.22236 14.3758C5.04221 14.1347 4.88773 13.819 4.77329 13.4167V13.4146C4.66602 13.0101 4.60534 12.5265 4.60534 11.962C4.60534 11.4181 4.66232 10.9494 4.76347 10.5574V10.5554C4.86393 10.1598 5.00787 9.85087 5.18154 9.61021C5.36019 9.3727 5.56232 9.2067 5.82232 9.08466L5.82801 9.0826L5.83369 9.07898C6.08481 8.95599 6.39386 8.88519 6.79074 8.88519C7.11574 8.88519 7.3569 8.92608 7.5018 8.97718L7.51369 8.98131L7.52506 8.98545C7.74417 9.05435 7.91776 9.1326 8.04286 9.20766L8.05268 9.21179L8.06249 9.21799C8.23789 9.31619 8.38399 9.40545 8.49813 9.48154L8.51001 9.4893L8.52345 9.49756C8.7591 9.64156 9.04446 9.73166 9.33218 9.73166C9.57903 9.73166 9.86442 9.68666 10.127 9.48206C10.2736 9.37236 10.3974 9.24737 10.5078 9.10689L10.5176 9.095L10.5275 9.08364L11.6349 7.54833L11.1817 7.09719C10.599 6.5145 9.93005 6.05791 9.18749 5.74172C8.42878 5.4153 7.56922 5.2632 6.62331 5.2632L6.62279 5.26215Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file$3, 12, 1, 161);
    			attr_dev(path1, "d", "M12.8032 17.7753V1H15.5916V7.44597C16.0432 7.017 16.5399 6.67079 17.0817 6.40738C17.6236 6.14397 18.2595 6.01227 18.9896 6.01227C19.6217 6.01227 20.1824 6.12139 20.6716 6.33965C21.1608 6.55037 21.5672 6.85142 21.8908 7.24277C22.222 7.62659 22.4703 8.08944 22.6359 8.6313C22.809 9.16564 22.8955 9.75642 22.8955 10.4037V17.7753H20.1072V10.4037C20.1072 9.69622 19.9416 9.15058 19.6105 8.76675C19.2868 8.37541 18.7977 8.17975 18.1429 8.17975C17.6612 8.17975 17.2097 8.28887 16.7882 8.50713C16.3668 8.72538 15.9679 9.02265 15.5916 9.39894V17.7753H12.8032Z");
    			attr_dev(path1, "fill", "currentColor");
    			attr_dev(path1, "stroke", "currentColor");
    			attr_dev(path1, "stroke-width", "1.5");
    			add_location(path1, file$3, 16, 1, 2560);
    			attr_dev(path2, "d", "M30.6866 6.01227C31.4166 6.01227 32.0865 6.12892 32.6961 6.36223C33.3132 6.59553 33.8438 6.93797 34.2878 7.38953C34.7318 7.83355 35.078 8.38294 35.3264 9.0377C35.5747 9.68493 35.6989 10.4262 35.6989 11.2616C35.6989 11.4723 35.6876 11.6492 35.665 11.7922C35.65 11.9277 35.6161 12.0368 35.5634 12.1196C35.5183 12.1948 35.4543 12.2513 35.3715 12.2889C35.2887 12.319 35.1834 12.3341 35.0554 12.3341H27.8983C27.9811 13.5232 28.3009 14.3962 28.8578 14.9531C29.4147 15.51 30.1523 15.7885 31.0704 15.7885C31.522 15.7885 31.9096 15.7358 32.2332 15.6305C32.5643 15.5251 32.8503 15.4084 33.0912 15.2805C33.3395 15.1526 33.554 15.0359 33.7346 14.9305C33.9228 14.8252 34.1034 14.7725 34.2765 14.7725C34.3894 14.7725 34.4872 14.7951 34.57 14.8402C34.6528 14.8853 34.7243 14.9493 34.7845 15.0321L35.5973 16.0481C35.2887 16.4094 34.9425 16.7142 34.5587 16.9625C34.1749 17.2034 33.7723 17.399 33.3508 17.5495C32.9369 17.6925 32.5117 17.7941 32.0752 17.8543C31.6462 17.9145 31.2285 17.9446 30.8221 17.9446C30.0168 17.9446 29.268 17.8129 28.5756 17.5495C27.8832 17.2786 27.2811 16.8835 26.7694 16.3642C26.2576 15.8374 25.855 15.1901 25.5615 14.4225C25.268 13.6473 25.1212 12.7517 25.1212 11.7357C25.1212 10.9455 25.2491 10.2042 25.505 9.51183C25.7609 8.81191 26.1259 8.20608 26.6 7.69432C27.0817 7.17503 27.665 6.76488 28.3498 6.46384C29.0422 6.1628 29.8211 6.01227 30.6866 6.01227H30.6866ZM30.7431 8.01041C29.9303 8.01041 29.2943 8.23996 28.8352 8.69904C28.3762 9.15812 28.0827 9.8091 27.9547 10.652H33.1928C33.1928 10.2908 33.1438 9.9521 33.046 9.63602C32.9482 9.3124 32.7977 9.03017 32.5945 8.78934C32.3913 8.54851 32.1354 8.36037 31.8268 8.2249C31.5182 8.08191 31.157 8.01041 30.7431 8.01041V8.01041Z");
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "stroke", "currentColor");
    			attr_dev(path2, "stroke-width", "1.5");
    			add_location(path2, file$3, 22, 1, 3195);
    			attr_dev(path3, "d", "M36.5717 6.1929H38.7843C38.995 6.1929 39.1719 6.24181 39.3149 6.33965C39.4579 6.43749 39.5482 6.56168 39.5858 6.71219L41.2453 12.8985C41.3356 13.2372 41.4071 13.5683 41.4598 13.8919C41.52 14.2156 41.5764 14.5392 41.6291 14.8628C41.7119 14.5392 41.7984 14.2156 41.8887 13.8919C41.9866 13.5683 42.0882 13.2372 42.1935 12.8985L44.1127 6.68961C44.1578 6.53909 44.2481 6.41492 44.3836 6.31708C44.5191 6.21924 44.6771 6.17032 44.8577 6.17032H46.0882C46.2914 6.17032 46.4607 6.21924 46.5962 6.31708C46.7317 6.41492 46.822 6.53909 46.8671 6.68961L48.7637 13.0114C48.8615 13.335 48.9481 13.6511 49.0233 13.9597C49.1061 14.2607 49.1851 14.5655 49.2604 14.8741C49.3131 14.5505 49.3695 14.2268 49.4297 13.9032C49.4975 13.5796 49.5802 13.2447 49.6781 12.8985L51.394 6.71219C51.4316 6.56168 51.5219 6.43749 51.6649 6.33965C51.8079 6.24181 51.9735 6.1929 52.1616 6.1929H54.2727L50.6038 17.7753H48.3573C48.1165 17.7753 47.9434 17.6097 47.838 17.2786L45.7495 10.5843C45.6818 10.366 45.6178 10.1478 45.5576 9.92952C45.505 9.70374 45.4598 9.48174 45.4222 9.26349C45.377 9.48926 45.3281 9.71503 45.2754 9.94081C45.2227 10.1591 45.1625 10.3811 45.0948 10.6069L42.9838 17.2786C42.8784 17.6097 42.6752 17.7753 42.3742 17.7753H40.2406L36.5717 6.1929Z");
    			attr_dev(path3, "fill", "currentColor");
    			attr_dev(path3, "stroke", "currentColor");
    			attr_dev(path3, "stroke-width", "1.5");
    			add_location(path3, file$3, 28, 1, 4965);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 56 19");
    			attr_dev(svg, "class", /*color*/ ctx[0]);
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$3, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				attr_dev(svg, "class", /*color*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChewLogo", slots, []);
    	let { color } = $$props;
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChewLogo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color];
    }

    class ChewLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChewLogo",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[0] === undefined && !("color" in props)) {
    			console.warn("<ChewLogo> was created without expected prop 'color'");
    		}
    	}

    	get color() {
    		throw new Error("<ChewLogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ChewLogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/logos/BBLogo.svelte generated by Svelte v3.29.7 */

    const file$4 = "src/shared/logos/BBLogo.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let rect;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			rect = svg_element("rect");
    			attr_dev(path0, "d", "M21.5156 42V16.4062H28.248C31.002 16.4062 33.082 16.9688 34.4883 18.0938C35.9062 19.207 36.6152 20.8301 36.6152 22.9629C36.6152 24.5098 36.2227 25.793 35.4375 26.8125C34.6523 27.832 33.5449 28.4824 32.1152 28.7637C33.7324 28.9746 35.0801 29.6777 36.1582 30.873C37.2363 32.0566 37.7754 33.416 37.7754 34.9512C37.7754 37.1309 37.0664 38.8535 35.6484 40.1191C34.2422 41.373 32.2793 42 29.7598 42H21.5156ZM22.4648 29.3613V41.0508H29.8652C32.0332 41.0508 33.7324 40.5176 34.9629 39.4512C36.2051 38.373 36.8262 36.8848 36.8262 34.9863C36.8262 33.3691 36.2285 32.0391 35.0332 30.9961C33.8379 29.9414 32.2383 29.3965 30.2344 29.3613H22.4648ZM22.4648 28.4121H28.5996C30.9316 28.4121 32.6895 27.9668 33.873 27.0762C35.0566 26.1738 35.6484 24.7793 35.6484 22.8926C35.6484 19.2598 33.252 17.4141 28.459 17.3555H22.4648V28.4121ZM50.8345 42H49.8853V16.4062H50.8345V42ZM69.5538 28.5352L65.4581 32.3145V42H64.5089V16.4062H65.4581V31.207L69.6769 27.0762L80.2941 16.4062H81.6652L70.257 27.8848L82.5441 42H81.3136L69.5538 28.5352ZM107.082 29.3086H94.2497V41.0508H108.875V42H93.3005V16.4062H108.875V17.3555H94.2497V28.3594H107.082V29.3086ZM135.065 35.8652C135.065 34.7754 134.807 33.8555 134.291 33.1055C133.787 32.3438 132.985 31.6758 131.883 31.1016C130.793 30.5156 129.141 29.918 126.926 29.3086C124.711 28.6992 123.047 28.084 121.934 27.4629C120.832 26.8418 120.024 26.1211 119.508 25.3008C118.992 24.4805 118.735 23.4844 118.735 22.3125C118.735 20.4492 119.52 18.9434 121.09 17.7949C122.66 16.6348 124.705 16.0547 127.225 16.0547C128.865 16.0547 130.336 16.377 131.637 17.0215C132.949 17.6543 133.963 18.5508 134.678 19.7109C135.393 20.8594 135.75 22.1602 135.75 23.6133H134.801C134.801 21.7031 134.098 20.127 132.692 18.8848C131.285 17.6309 129.463 17.0039 127.225 17.0039C124.975 17.0039 123.153 17.5078 121.758 18.5156C120.375 19.5117 119.684 20.7656 119.684 22.2773C119.684 23.8125 120.287 25.0488 121.494 25.9863C122.701 26.9238 124.694 27.7559 127.471 28.4824C130.248 29.1973 132.281 30.0293 133.571 30.9785C135.211 32.1855 136.031 33.8027 136.031 35.8301C136.031 37.1191 135.668 38.2617 134.942 39.2578C134.215 40.2422 133.184 41.0039 131.848 41.543C130.512 42.082 129.012 42.3516 127.348 42.3516C125.496 42.3516 123.832 42.0469 122.356 41.4375C120.879 40.8164 119.766 39.9375 119.016 38.8008C118.278 37.6641 117.908 36.3223 117.908 34.7754H118.858C118.858 36.873 119.643 38.502 121.213 39.6621C122.783 40.8223 124.828 41.4023 127.348 41.4023C129.586 41.4023 131.432 40.8926 132.885 39.873C134.338 38.8418 135.065 37.5059 135.065 35.8652ZM165.227 42H164.278V29.3086H147.93V42H146.981V16.4062H147.93V28.3594H164.278V16.4062H165.227V42ZM191.997 34.3535H179.464L176.617 42H175.579L185.16 16.4062H186.32L195.9 42H194.863L191.997 34.3535ZM179.816 33.4043H191.646L185.74 17.5488L179.816 33.4043ZM215.709 31.0488H206.832V42H205.883V16.4062H214.039C216.605 16.4062 218.644 17.0684 220.156 18.3926C221.68 19.7168 222.441 21.5156 222.441 23.7891C222.441 25.5352 221.896 27.0645 220.807 28.377C219.728 29.6777 218.351 30.4863 216.676 30.8027L223.514 41.7539V42H222.512L215.709 31.0488ZM206.832 30.0996H214.9C216.869 30.0996 218.457 29.502 219.664 28.3066C220.883 27.1113 221.492 25.6055 221.492 23.7891C221.492 21.7969 220.818 20.2266 219.471 19.0781C218.135 17.9297 216.301 17.3555 213.969 17.3555H206.832V30.0996ZM249.247 29.3086H236.415V41.0508H251.04V42H235.465V16.4062H251.04V17.3555H236.415V28.3594H249.247V29.3086Z");
    			attr_dev(path0, "fill", "currentColor");
    			add_location(path0, file$4, 12, 1, 163);
    			attr_dev(path1, "d", "M21.8672 97V45.8125H40.2539C46.8398 45.8125 51.8438 47.0195 55.2656 49.4336C58.7109 51.8477 60.4336 55.3516 60.4336 59.9453C60.4336 62.5938 59.8242 64.8555 58.6055 66.7305C57.3867 68.6055 55.5938 69.9883 53.2266 70.8789C55.8984 71.582 57.9492 72.8945 59.3789 74.8164C60.8086 76.7383 61.5234 79.082 61.5234 81.8477C61.5234 86.8633 59.9297 90.6367 56.7422 93.168C53.5781 95.6758 48.8789 96.9531 42.6445 97H21.8672ZM34.207 75.2383V87.5078H42.293C44.5195 87.5078 46.2305 87.0039 47.4258 85.9961C48.6211 84.9648 49.2188 83.5234 49.2188 81.6719C49.2188 77.4062 47.0977 75.2617 42.8555 75.2383H34.207ZM34.207 67.1523H40.6406C43.3359 67.1289 45.2578 66.6367 46.4062 65.6758C47.5547 64.7148 48.1289 63.2969 48.1289 61.4219C48.1289 59.2656 47.5078 57.7188 46.2656 56.7812C45.0234 55.8203 43.0195 55.3398 40.2539 55.3398H34.207V67.1523ZM109.572 45.8125V79.3164C109.572 83.1133 108.764 86.4062 107.146 89.1953C105.529 91.9609 103.209 94.0703 100.185 95.5234C97.162 96.9766 93.5878 97.7031 89.4628 97.7031C83.2284 97.7031 78.3183 96.0859 74.7323 92.8516C71.1464 89.6172 69.3183 85.1875 69.248 79.5625V45.8125H81.6581V79.8086C81.7988 85.4102 84.4003 88.2109 89.4628 88.2109C92.0175 88.2109 93.9511 87.5078 95.2636 86.1016C96.5761 84.6953 97.2323 82.4102 97.2323 79.2461V45.8125H109.572ZM118.387 97V45.8125H134.875C139.398 45.8125 143.465 46.8438 147.074 48.9062C150.683 50.9453 153.496 53.8398 155.512 57.5898C157.551 61.3164 158.582 65.5 158.605 70.1406V72.4961C158.605 77.1836 157.609 81.3906 155.617 85.1172C153.648 88.8203 150.859 91.7266 147.25 93.8359C143.664 95.9219 139.656 96.9766 135.226 97H118.387ZM130.726 55.3398V87.5078H135.015C138.555 87.5078 141.273 86.2539 143.172 83.7461C145.07 81.2148 146.019 77.4648 146.019 72.4961V70.2812C146.019 65.3359 145.07 61.6094 143.172 59.1016C141.273 56.5938 138.508 55.3398 134.875 55.3398H130.726ZM166.013 97V45.8125H182.502C187.025 45.8125 191.092 46.8438 194.701 48.9062C198.31 50.9453 201.123 53.8398 203.138 57.5898C205.178 61.3164 206.209 65.5 206.232 70.1406V72.4961C206.232 77.1836 205.236 81.3906 203.244 85.1172C201.275 88.8203 198.486 91.7266 194.877 93.8359C191.291 95.9219 187.283 96.9766 182.853 97H166.013ZM178.353 55.3398V87.5078H182.642C186.181 87.5078 188.9 86.2539 190.799 83.7461C192.697 81.2148 193.646 77.4648 193.646 72.4961V70.2812C193.646 65.3359 192.697 61.6094 190.799 59.1016C188.9 56.5938 186.135 55.3398 182.502 55.3398H178.353ZM230.832 68.0312L240.254 45.8125H253.578L237.09 78.6133V97H224.574V78.6133L208.121 45.8125H221.375L230.832 68.0312Z");
    			attr_dev(path1, "fill", "currentColor");
    			add_location(path1, file$4, 16, 1, 3605);
    			attr_dev(rect, "x", "1.5");
    			attr_dev(rect, "y", "1.5");
    			attr_dev(rect, "width", "268");
    			attr_dev(rect, "height", "111");
    			attr_dev(rect, "stroke", "currentColor");
    			attr_dev(rect, "stroke-width", "3");
    			add_location(rect, file$4, 20, 1, 6154);
    			attr_dev(svg, "class", /*color*/ ctx[0]);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "viewBox", "0 0 271 114");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$4, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, rect);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				attr_dev(svg, "class", /*color*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BBLogo", slots, []);
    	let { color } = $$props;
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BBLogo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color];
    }

    class BBLogo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BBLogo",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[0] === undefined && !("color" in props)) {
    			console.warn("<BBLogo> was created without expected prop 'color'");
    		}
    	}

    	get color() {
    		throw new Error("<BBLogo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<BBLogo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Angular.svelte generated by Svelte v3.29.7 */

    const file$5 = "src/shared/icons/Angular.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M52.864 64h23.28l-12.375-25.877zM63.81 1.026l-59.257 20.854 9.363 77.637 49.957 27.457 50.214-27.828 9.36-77.635-59.637-20.485zm-15.766 73.974l-7.265 18.176-13.581.056 36.608-81.079-.07-.153h-.064l.001-.133.063.133h.14100000000000001l.123-.274v.274h-.124l-.069.153 38.189 81.417-13.074-.287-8.042-18.58-17.173.082");
    			add_location(path, file$5, 6, 2, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$5, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Angular", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Angular> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Angular extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Angular",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Angular> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Angular> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Angular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Angular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Angular>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Angular>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Express.svelte generated by Svelte v3.29.7 */

    const file$6 = "src/shared/icons/Express.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path0, "d", "M126.67,98.44c-4.56,1.16-7.38.05-9.91-3.75-5.68-8.51-11.95-16.63-18-24.9-.78-1.07-1.59-2.12-2.6-3.45C89,76,81.85,85.2,75.14,94.77c-2.4,3.42-4.92,4.91-9.4,3.7L92.66,62.34,67.6,29.71c4.31-.84,7.29-.41,9.93,3.45,5.83,8.52,12.26,16.63,18.67,25.21C102.65,49.82,109,41.7,115,33.26c2.41-3.42,5-4.72,9.33-3.46-3.28,4.35-6.49,8.63-9.72,12.88-4.36,5.73-8.64,11.53-13.16,17.14-1.61,2-1.35,3.3.09,5.19C109.9,76,118.16,87.1,126.67,98.44Z");
    			add_location(path0, file$6, 7, 2, 121);
    			attr_dev(path1, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path1, "d", "M1.33,61.74c.72-3.61,1.2-7.29,2.2-10.83,6-21.43,30.6-30.34,47.5-17.06C60.93,41.64,63.39,52.62,62.9,65H7.1c-.84,22.21,15.15,35.62,35.53,28.78,7.15-2.4,11.36-8,13.47-15,1.07-3.51,2.84-4.06,6.14-3.06-1.69,8.76-5.52,16.08-13.52,20.66-12,6.86-29.13,4.64-38.14-4.89C5.26,85.89,3,78.92,2,71.39c-.15-1.2-.46-2.38-.7-3.57Q1.33,64.78,1.33,61.74ZM7.2,60.25H57.63c-.33-16.06-10.33-27.47-24-27.57C18.63,32.56,7.85,43.7,7.2,60.25Z");
    			add_location(path1, file$6, 11, 2, 586);
    			attr_dev(g, "id", "original");
    			add_location(g, file$6, 6, 2, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$6, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			}

    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path1, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Express", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Express> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Express extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Express",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Express> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Express> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Express>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Express>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Express>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Express>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Firebase.svelte generated by Svelte v3.29.7 */

    const file$7 = "src/shared/icons/Firebase.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let g;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M0 0h192v192H0z");
    			add_location(path0, file$7, 7, 2, 119);
    			attr_dev(path1, "d", "M36.227 122.934L53.655 11.388a4 4 0 0 1 7.477-1.275l18.74 34.96zm65.373 59.553a11.989 11.989 0 0 1-11.696-.02L32 150 136.636 45.175a3.994 3.994 0 0 1 6.771 2.164l8.292 51.302A46.308 46.308 0 0 0 144 98c-25.405 0-46 20.595-46 46 0 12.856 5.274 24.48 13.775 32.827zM33.584 139.92L92.461 34.888a3.999 3.999 0 0 1 7.081 0l13.406 25.525zM104 144c0-22.091 17.909-40 40-40s40 17.909 40 40-17.909 40-40 40-40-17.909-40-40zm22 14.004a3.998 3.998 0 0 0 3.99 3.996h28.02a3.992 3.992 0 0 0 3.99-3.996V150h-36zm0-13.988a3.997 3.997 0 0 0 3.99 3.984h28.02a3.987 3.987 0 0 0 3.99-3.984v-14.032a3.997 3.997 0 0 0-3.99-3.984h-28.02a3.987 3.987 0 0 0-3.99 3.984zM130 130h28v6h-28zm0 11.01c0-.56.428-1.01 1.01-1.01h1.98c.56 0 1.01.428 1.01 1.01v1.98a.994.994 0 0 1-1.01 1.01h-1.98a.994.994 0 0 1-1.01-1.01zm0 14c0-.56.428-1.01 1.01-1.01h1.98c.56 0 1.01.428 1.01 1.01v1.98a.994.994 0 0 1-1.01 1.01h-1.98a.994.994 0 0 1-1.01-1.01z");
    			attr_dev(path1, "fill", /*fillColor*/ ctx[0]);
    			add_location(path1, file$7, 8, 2, 150);
    			attr_dev(g, "fill", "none");
    			add_location(g, file$7, 6, 2, 101);
    			attr_dev(svg, "viewBox", "0 0 192 192");
    			add_location(svg, file$7, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path1, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Firebase", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Firebase> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Firebase extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Firebase",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Firebase> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Firebase> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Firebase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Firebase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Firebase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Firebase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Git.svelte generated by Svelte v3.29.7 */

    const file$8 = "src/shared/icons/Git.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M124.737 58.378l-55.116-55.114c-3.172-3.174-8.32-3.174-11.497 0l-11.444 11.446 14.518 14.518c3.375-1.139 7.243-.375 9.932 2.314 2.703 2.706 3.461 6.607 2.294 9.993l13.992 13.993c3.385-1.167 7.292-.413 9.994 2.295 3.78 3.777 3.78 9.9 0 13.679-3.78 3.78-9.901 3.78-13.683 0-2.842-2.844-3.545-7.019-2.105-10.521l-13.048-13.048-.002 34.341c.922.455 1.791 1.063 2.559 1.828 3.778 3.777 3.778 9.898 0 13.683-3.779 3.777-9.904 3.777-13.679 0-3.778-3.784-3.778-9.905 0-13.683.934-.933 2.014-1.638 3.167-2.11v-34.659c-1.153-.472-2.231-1.172-3.167-2.111-2.862-2.86-3.551-7.06-2.083-10.576l-14.313-14.313-37.792 37.79c-3.175 3.177-3.175 8.325 0 11.5l55.117 55.114c3.174 3.174 8.32 3.174 11.499 0l54.858-54.858c3.174-3.176 3.174-8.327-.001-11.501z");
    			add_location(path, file$8, 5, 27, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$8, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Git", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Git> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Git extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Git",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Git> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Git> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Git>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Git>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Git>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Git>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/HTML5.svelte generated by Svelte v3.29.7 */

    const file$9 = "src/shared/icons/HTML5.svelte";

    function create_fragment$9(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M9.032 2l10.005 112.093 44.896 12.401 45.02-12.387 10.015-112.107h-109.936zm89.126 26.539l-.627 7.172-.276 3.289h-52.665000000000006l1.257 14h50.156000000000006l-.336 3.471-3.233 36.119-.238 2.27-28.196 7.749v.002l-.034.018-28.177-7.423-1.913-21.206h13.815000000000001l.979 10.919 15.287 4.081h.043v-.546l15.355-3.875 1.604-17.579h-47.698l-3.383-38.117-.329-3.883h68.939l-.33 3.539z");
    			add_location(path, file$9, 5, 27, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$9, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("HTML5", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HTML5> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class HTML5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HTML5",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<HTML5> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<HTML5> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<HTML5>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<HTML5>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<HTML5>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<HTML5>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Javascript.svelte generated by Svelte v3.29.7 */

    const file$a = "src/shared/icons/Javascript.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path0, "d", "M1.408 1.408h125.184v125.185h-125.184z");
    			add_location(path0, file$a, 5, 27, 101);
    			attr_dev(path1, "fill", /*backgroundColor*/ ctx[1]);
    			attr_dev(path1, "d", "M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zm-46.885-37.793h-11.709l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z");
    			add_location(path1, file$a, 8, 2, 180);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$a, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			}

    			if (dirty & /*backgroundColor*/ 2) {
    				attr_dev(path1, "fill", /*backgroundColor*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Javascript", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Javascript> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Javascript extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Javascript",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Javascript> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Javascript> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Javascript>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Javascript>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Javascript>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Javascript>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Node.svelte generated by Svelte v3.29.7 */

    const file$b = "src/shared/icons/Node.svelte";

    function create_fragment$b(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M112.771 30.334l-44.097-25.605c-2.781-1.584-6.402-1.584-9.205 0l-44.568 25.605c-2.87 1.651-4.901 4.754-4.901 8.073v51.142c0 3.319 2.084 6.423 4.954 8.083l11.775 6.688c5.628 2.772 7.617 2.772 10.178 2.772 8.333 0 13.093-5.039 13.093-13.828v-50.49c0-.713-.371-1.774-1.071-1.774h-5.623c-.712 0-2.306 1.061-2.306 1.773v50.49c0 3.896-3.524 7.773-10.11 4.48l-12.167-7.013c-.424-.23-.723-.693-.723-1.181v-51.142c0-.482.555-.966.982-1.213l44.424-25.561c.415-.235 1.025-.235 1.439 0l43.882 25.555c.42.253.272.722.272 1.219v51.142c0 .488.183.963-.232 1.198l-44.086 25.576c-.378.227-.847.227-1.261 0l-11.307-6.749c-.341-.198-.746-.269-1.073-.086-3.146 1.783-3.726 2.02-6.677 3.043-.726.253-1.797.692.41 1.929l14.798 8.754c1.417.82 3.027 1.246 4.647 1.246 1.642 0 3.25-.426 4.667-1.246l43.885-25.582c2.87-1.672 4.23-4.764 4.23-8.083v-51.142c0-3.319-1.36-6.414-4.229-8.073zM77.91 81.445c-11.726 0-14.309-3.235-15.17-9.066-.1-.628-.633-1.379-1.272-1.379h-5.731c-.709 0-1.279.86-1.279 1.566 0 7.466 4.059 16.512 23.453 16.512 14.039 0 22.088-5.455 22.088-15.109 0-9.572-6.467-12.084-20.082-13.886-13.762-1.819-15.16-2.738-15.16-5.962 0-2.658 1.184-6.203 11.374-6.203 9.105 0 12.461 1.954 13.842 8.091.118.577.645.991 1.24.991h5.754c.354 0 .692-.143.94-.396.24-.272.367-.613.335-.979-.891-10.568-7.912-15.493-22.112-15.493-12.631 0-20.166 5.334-20.166 14.275 0 9.698 7.497 12.378 19.622 13.577 14.505 1.422 15.633 3.542 15.633 6.395 0 4.955-3.978 7.066-13.309 7.066z");
    			add_location(path, file$b, 6, 2, 104);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$b, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Node", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Node> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Node extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Node",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Node> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Node> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Node>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Node>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Npm.svelte generated by Svelte v3.29.7 */

    const file$c = "src/shared/icons/Npm.svelte";

    function create_fragment$c(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "id", "original-wordmark");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M2,38.5H126V82.21H64V89.5H36.44V82.21H2ZM8.89,74.93H22.67V53.07h6.89V74.93h6.89V45.79H8.89ZM43.33,45.79V82.21H57.11V74.93H70.89V45.79Zm13.78,7.29H64V67.64H57.11Zm20.67-7.29V74.93H91.56V53.07h6.89V74.93h6.89V53.07h6.89V74.93h6.89V45.79Z");
    			add_location(path, file$c, 6, 1, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$c, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Npm", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Npm> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Npm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Npm",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Npm> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Npm> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Npm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Npm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Npm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Npm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Python.svelte generated by Svelte v3.29.7 */

    const file$d = "src/shared/icons/Python.svelte";

    function create_fragment$d(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M49.33 62h29.159c8.117 0 14.511-6.868 14.511-15.019v-27.798c0-7.912-6.632-13.856-14.555-15.176-5.014-.835-10.195-1.215-15.187-1.191-4.99.023-9.612.448-13.805 1.191-12.355 2.181-14.453 6.751-14.453 15.176v10.817h29v4h-40.224000000000004c-8.484 0-15.914 5.108-18.237 14.811-2.681 11.12-2.8 17.919 0 29.53 2.075 8.642 7.03 14.659 15.515 14.659h9.946v-13.048c0-9.637 8.428-17.952 18.33-17.952zm-1.838-39.11c-3.026 0-5.478-2.479-5.478-5.545 0-3.079 2.451-5.581 5.478-5.581 3.015 0 5.479 2.502 5.479 5.581-.001 3.066-2.465 5.545-5.479 5.545zM122.281 48.811c-2.098-8.448-6.103-14.811-14.599-14.811h-10.682v12.981c0 10.05-8.794 18.019-18.511 18.019h-29.159c-7.988 0-14.33 7.326-14.33 15.326v27.8c0 7.91 6.745 12.564 14.462 14.834 9.242 2.717 17.994 3.208 29.051 0 7.349-2.129 14.487-6.411 14.487-14.834v-11.126h-29v-4h43.682c8.484 0 11.647-5.776 14.599-14.66 3.047-9.145 2.916-17.799 0-29.529zm-41.955 55.606c3.027 0 5.479 2.479 5.479 5.547 0 3.076-2.451 5.579-5.479 5.579-3.015 0-5.478-2.502-5.478-5.579 0-3.068 2.463-5.547 5.478-5.547z");
    			add_location(path, file$d, 5, 27, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$d, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Python", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Python> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Python extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Python",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Python> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Python> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Python>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Python>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Python>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Python>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/React.svelte generated by Svelte v3.29.7 */

    const file$e = "src/shared/icons/React.svelte";

    function create_fragment$e(ctx) {
    	let svg;
    	let g;
    	let circle;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g = svg_element("g");
    			circle = svg_element("circle");
    			path = svg_element("path");
    			attr_dev(circle, "cx", "64");
    			attr_dev(circle, "cy", "64");
    			attr_dev(circle, "r", "11.4");
    			add_location(circle, file$e, 6, 4, 126);
    			attr_dev(path, "d", "M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3-12.5 4.8-19.3 11.4-19.3 18.8s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zm-14.8-30.5c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zm-11.2 59.3c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zm-25.6 27.1c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zm25.6-27.1c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zm-54.5-16.2c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zm-24.7 29c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5-13.8-4-22.1-10-22.1-15.6zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zm60.8-20.3c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-2 .8-4.2 1.5-6.4 2.1-1.6-5-3.6-10.3-6-15.6 2.4-5.3 4.5-10.5 6-15.5 13.8 4 22.1 10 22.1 15.6 0 4.7-5.8 9.7-15.7 13.4z");
    			add_location(path, file$e, 7, 4, 166);
    			attr_dev(g, "fill", /*fillColor*/ ctx[0]);
    			add_location(g, file$e, 5, 27, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$e, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g);
    			append_dev(g, circle);
    			append_dev(g, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(g, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("React", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<React> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class React extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "React",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<React> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<React> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<React>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<React>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<React>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<React>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Svelte.svelte generated by Svelte v3.29.7 */

    const file$f = "src/shared/icons/Svelte.svelte";

    function create_fragment$f(ctx) {
    	let svg;
    	let path0;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path0, "d", "M94.1566,22.8189c-10.4-14.8851-30.94-19.2971-45.7914-9.8348L22.2825,29.6078A29.9234,29.9234,0,0,0,8.7639,49.6506a31.5136,31.5136,0,0,0,3.1076,20.2318A30.0061,30.0061,0,0,0,7.3953,81.0653a31.8886,31.8886,0,0,0,5.4473,24.1157c10.4022,14.8865,30.9423,19.2966,45.7914,9.8348L84.7167,98.3921A29.9177,29.9177,0,0,0,98.2353,78.3493,31.5263,31.5263,0,0,0,95.13,58.117a30,30,0,0,0,4.4743-11.1824,31.88,31.88,0,0,0-5.4473-24.1157");
    			add_location(path0, file$f, 5, 62, 136);
    			attr_dev(path1, "d", "M45.8171,106.5815A20.7182,20.7182,0,0,1,23.58,98.3389a19.1739,19.1739,0,0,1-3.2766-14.5025,18.1886,18.1886,0,0,1,.6233-2.4357l.4912-1.4978,1.3363.9815a33.6443,33.6443,0,0,0,10.203,5.0978l.9694.2941-.0893.9675a5.8474,5.8474,0,0,0,1.052,3.8781,6.2389,6.2389,0,0,0,6.6952,2.485,5.7449,5.7449,0,0,0,1.6021-.7041L69.27,76.281a5.4306,5.4306,0,0,0,2.4506-3.631,5.7948,5.7948,0,0,0-.9875-4.3712,6.2436,6.2436,0,0,0-6.6978-2.4864,5.7427,5.7427,0,0,0-1.6.7036l-9.9532,6.3449a19.0329,19.0329,0,0,1-5.2965,2.3259,20.7181,20.7181,0,0,1-22.2368-8.2427,19.1725,19.1725,0,0,1-3.2766-14.5024,17.9885,17.9885,0,0,1,8.13-12.0513L55.8833,23.7472a19.0038,19.0038,0,0,1,5.3-2.3287A20.7182,20.7182,0,0,1,83.42,29.6611a19.1739,19.1739,0,0,1,3.2766,14.5025,18.4,18.4,0,0,1-.6233,2.4357l-.4912,1.4978-1.3356-.98a33.6175,33.6175,0,0,0-10.2037-5.1l-.9694-.2942.0893-.9675a5.8588,5.8588,0,0,0-1.052-3.878,6.2389,6.2389,0,0,0-6.6952-2.485,5.7449,5.7449,0,0,0-1.6021.7041L37.73,51.719a5.4218,5.4218,0,0,0-2.4487,3.63,5.7862,5.7862,0,0,0,.9856,4.3717,6.2437,6.2437,0,0,0,6.6978,2.4864,5.7652,5.7652,0,0,0,1.602-.7041l9.9519-6.3425a18.978,18.978,0,0,1,5.2959-2.3278,20.7181,20.7181,0,0,1,22.2368,8.2427,19.1725,19.1725,0,0,1,3.2766,14.5024,17.9977,17.9977,0,0,1-8.13,12.0532L51.1167,104.2528a19.0038,19.0038,0,0,1-5.3,2.3287");
    			attr_dev(path1, "fill", /*backgroundColor*/ ctx[1]);
    			add_location(path1, file$f, 9, 2, 609);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 107 120");
    			add_location(svg, file$f, 5, 0, 74);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			}

    			if (dirty & /*backgroundColor*/ 2) {
    				attr_dev(path1, "fill", /*backgroundColor*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Svelte", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svelte> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Svelte extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svelte",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Svelte> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Svelte> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Svelte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Svelte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Svelte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Svelte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Tailwind.svelte generated by Svelte v3.29.7 */

    const file$g = "src/shared/icons/Tailwind.svelte";

    function create_fragment$g(ctx) {
    	let svg;
    	let path0;
    	let defs;
    	let path1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			defs = svg_element("defs");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "d", "M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z");
    			attr_dev(path0, "clip-rule", "evenodd");
    			add_location(path0, file$g, 6, 2, 146);
    			attr_dev(path1, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path1, "d", "M0 0h54v32.4H0z");
    			add_location(path1, file$g, 13, 2, 731);
    			add_location(defs, file$g, 12, 1, 722);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 54 45");
    			add_location(svg, file$g, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, defs);
    			append_dev(defs, path1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path0, "fill", /*fillColor*/ ctx[0]);
    			}

    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path1, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tailwind", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tailwind> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Tailwind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwind",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Tailwind> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Tailwind> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Tailwind>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Tailwind>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Tailwind>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Tailwind>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/Typescript.svelte generated by Svelte v3.29.7 */

    const file$h = "src/shared/icons/Typescript.svelte";

    function create_fragment$h(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M2,63.91v62.5H127V1.41H2Zm100.73-5a15.56,15.56,0,0,1,7.82,4.5,20.58,20.58,0,0,1,3,4c0,.16-5.4,3.81-8.69,5.85-.12.08-.6-.44-1.13-1.23a7.09,7.09,0,0,0-5.87-3.53c-3.79-.26-6.23,1.73-6.21,5a4.58,4.58,0,0,0,.54,2.34c.83,1.73,2.38,2.76,7.24,4.86,8.95,3.85,12.78,6.39,15.16,10,2.66,4,3.25,10.46,1.45,15.24-2,5.2-6.9,8.73-13.83,9.9a38.32,38.32,0,0,1-9.52-.1A23,23,0,0,1,80,109.19c-1.15-1.27-3.39-4.58-3.25-4.82a9.34,9.34,0,0,1,1.15-.73L82.5,101l3.59-2.08.75,1.11a16.78,16.78,0,0,0,4.74,4.54c4,2.1,9.46,1.81,12.16-.62a5.43,5.43,0,0,0,.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48,16.48,0,0,1-3.43-6.25,25,25,0,0,1-.22-8c1.33-6.23,6-10.58,12.82-11.87A31.66,31.66,0,0,1,102.73,58.93ZM73.39,64.15l0,5.12H57.16V115.5H45.65V69.26H29.38v-5a49.19,49.19,0,0,1,.14-5.16c.06-.08,10-.12,22-.1L73.33,59Z");
    			add_location(path, file$h, 6, 1, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$h, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Typescript", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typescript> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class Typescript extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typescript",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<Typescript> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<Typescript> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<Typescript>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<Typescript>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<Typescript>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<Typescript>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/icons/VisualStudio.svelte generated by Svelte v3.29.7 */

    const file$i = "src/shared/icons/VisualStudio.svelte";

    function create_fragment$i(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			attr_dev(path, "d", "M95 2.3l30.5 12.3v98.7L94.8 125.7 45.8 77l-31 24.1L2.5 94.9V33.1l12.3-5.9 31 24.3ZM14.8 45.7V83.2l18.5-19Zm48.1 18.5L94.8 89.3V39Z");
    			add_location(path, file$i, 6, 1, 101);
    			attr_dev(svg, "viewBox", "0 0 128 128");
    			add_location(svg, file$i, 5, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fillColor*/ 1) {
    				attr_dev(path, "fill", /*fillColor*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VisualStudio", slots, []);
    	let { fillColor } = $$props;
    	let { backgroundColor } = $$props;
    	const writable_props = ["fillColor", "backgroundColor"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VisualStudio> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	$$self.$capture_state = () => ({ fillColor, backgroundColor });

    	$$self.$inject_state = $$props => {
    		if ("fillColor" in $$props) $$invalidate(0, fillColor = $$props.fillColor);
    		if ("backgroundColor" in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fillColor, backgroundColor];
    }

    class VisualStudio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { fillColor: 0, backgroundColor: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VisualStudio",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fillColor*/ ctx[0] === undefined && !("fillColor" in props)) {
    			console.warn("<VisualStudio> was created without expected prop 'fillColor'");
    		}

    		if (/*backgroundColor*/ ctx[1] === undefined && !("backgroundColor" in props)) {
    			console.warn("<VisualStudio> was created without expected prop 'backgroundColor'");
    		}
    	}

    	get fillColor() {
    		throw new Error("<VisualStudio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fillColor(value) {
    		throw new Error("<VisualStudio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<VisualStudio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<VisualStudio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const skills = {
    	Frontend: {
    		HTML5: HTML5,
    		React: React,
    		Angular: Angular,
    		Svelte: Svelte,
    		Javascript: Javascript,
    		Typescript: Typescript,
    		"Tailwind CSS": Tailwind,
    	},

    	Backend: {
    		"Node.js": Node,
    		express: Express,
    		python: Python,
    		Firebase: Firebase,
    	},
    	"Workflow & Misc": {
    		git: Git,
    		npm: Npm,
    		"Visual Studio": VisualStudio,
    	},
    };

    const projects = {
    	bikeshare: {
    		bodyText:
    			"BikeshareBuddy lets users save a list of their favorite bikeshare stations to easily find out if there are available docks and/or bikes. Bikeshare system data is pulled from the General Bikeshare Feed Specification data. Built with Angular, Firebase, and the Google Maps API.",
    		title: "BikeshareBuddy",
    		titleComponent: BBLogo,
    		sourceCodeLink: "https://github.com/lauraschultz/BikeshareBuddy",
    		siteLink: "https://lauraschultz.github.io/BikeshareBuddy/search",
    		icons: [skills.Frontend.Angular, skills.Backend.Firebase],
    	},
    	chew: {
    		bodyText:
    			"Chew allows groups of people to easily decide on a restaurant together. After someone begins a session and shares the link, others can begin adding restaurants to the shared list and voting on each other's suggestions. Restaurant data is pulled from the Yelp API. Built using React, Node.js, express, Firebase, and Socket.io.",
    		title: "Chew",
    		titleComponent: ChewLogo,
    		sourceCodeLink: "https://github.com/lauraschultz/chew",
    		siteLink: "https://lauraschultz.dev/chew",
    		icons: [
    			skills.Frontend.React,
    			skills.Frontend["Tailwind CSS"],
    			skills.Backend["Node.js"],
    			skills.Backend.Firebase,
    		],
    	},
    	trivia: {
    		bodyText:
    			"Using questions retrieved from the Open Trivia Database, users can compete against their friends and see the live point total as they play. Built with React, Node.js, express, and Socket.io.",
    		title: "Multiplayer Trivia Game",
    		sourceCodeLink: "https://github.com/lauraschultz/trivia",
    		siteLink: "https://lauraschultz.github.io/trivia/",
    		icons: [
    			skills.Frontend.React,
    			skills.Frontend["Tailwind CSS"],
    			skills.Backend["Node.js"],
    		],
    	},
    	halloween: {
    		bodyText:
    			"For a safe and socially-distant halloween 2020! On the user side, kids and parents can request candy, and on the admin side, candy orders appear with an accompanying sound effect. Built using React and Firebase.",
    		title: "Trick or Treat!",
    		sourceCodeLink: "https://github.com/lauraschultz/trickOrTreat",
    		siteLink: "https://lauraschultz.dev/trickOrTreat",
    		icons: [
    			skills.Frontend.React,
    			skills.Frontend["Tailwind CSS"],
    			skills.Backend.Firebase,
    		],
    	},
    };

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/shared/Modal.svelte generated by Svelte v3.29.7 */
    const file$j = "src/shared/Modal.svelte";

    // (29:0) {#if open}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let i;
    	let t;
    	let clickOutside_action;
    	let div1_intro;
    	let div1_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			i = element("i");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$j, 41, 5, 941);
    			attr_dev(button, "class", "absolute top-0 right-0 my-3 mx-5 text-gray-400 leading-tight");
    			add_location(button, file$j, 38, 3, 832);
    			attr_dev(div0, "class", "lg:rounded-lg shadow-lg overflow-y-scroll max-h-full relative z-50");
    			add_location(div0, file$j, 34, 2, 682);
    			attr_dev(div1, "class", "fixed left-0 top-0 w-screen h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center z-40");
    			add_location(div1, file$j, 29, 1, 540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, i);
    			append_dev(div0, t);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*onClose*/ ctx[1])) /*onClose*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					action_destroyer(clickOutside_action = /*clickOutside*/ ctx[3].call(null, div0, {
    						enabled: /*gEnabled*/ ctx[2],
    						close: /*onClose*/ ctx[1]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (clickOutside_action && is_function(clickOutside_action.update) && dirty & /*gEnabled, onClose*/ 6) clickOutside_action.update.call(null, {
    				enabled: /*gEnabled*/ ctx[2],
    				close: /*onClose*/ ctx[1]
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fade, {});
    				div1_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(29:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { open } = $$props;
    	let { onClose } = $$props;
    	let gEnabled;

    	function clickOutside(node, { enabled, close }) {
    		const handleOutsideClick = ({ target }) => {
    			if (!node.contains(target) && gEnabled) {
    				close();
    			}
    		};

    		window.addEventListener("click", handleOutsideClick);

    		return {
    			destroy() {
    				window.removeEventListener("click", handleOutsideClick);
    				$$invalidate(2, gEnabled = false);
    			}
    		};
    	}

    	const writable_props = ["open", "onClose"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("onClose" in $$props) $$invalidate(1, onClose = $$props.onClose);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		open,
    		onClose,
    		fade,
    		gEnabled,
    		clickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("onClose" in $$props) $$invalidate(1, onClose = $$props.onClose);
    		if ("gEnabled" in $$props) $$invalidate(2, gEnabled = $$props.gEnabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open*/ 1) {
    			 if (open) {
    				setTimeout(() => $$invalidate(2, gEnabled = true), 50);
    			}
    		}
    	};

    	return [open, onClose, gEnabled, clickOutside, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { open: 0, onClose: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*open*/ ctx[0] === undefined && !("open" in props)) {
    			console.warn("<Modal> was created without expected prop 'open'");
    		}

    		if (/*onClose*/ ctx[1] === undefined && !("onClose" in props)) {
    			console.warn("<Modal> was created without expected prop 'onClose'");
    		}
    	}

    	get open() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var marked = createCommonjsModule(function (module, exports) {
    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2020, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;

        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

        return arr2;
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it;

        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            return function () {
              if (i >= o.length) return {
                done: true
              };
              return {
                done: false,
                value: o[i++]
              };
            };
          }

          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }

        it = o[Symbol.iterator]();
        return it.next.bind(it);
      }

      function createCommonjsModule(fn, module) {
      	return module = { exports: {} }, fn(module, module.exports), module.exports;
      }

      var defaults = createCommonjsModule(function (module) {
        function getDefaults() {
          return {
            baseUrl: null,
            breaks: false,
            gfm: true,
            headerIds: true,
            headerPrefix: '',
            highlight: null,
            langPrefix: 'language-',
            mangle: true,
            pedantic: false,
            renderer: null,
            sanitize: false,
            sanitizer: null,
            silent: false,
            smartLists: false,
            smartypants: false,
            tokenizer: null,
            walkTokens: null,
            xhtml: false
          };
        }

        function changeDefaults(newDefaults) {
          module.exports.defaults = newDefaults;
        }

        module.exports = {
          defaults: getDefaults(),
          getDefaults: getDefaults,
          changeDefaults: changeDefaults
        };
      });
      var defaults_1 = defaults.defaults;
      var defaults_2 = defaults.getDefaults;
      var defaults_3 = defaults.changeDefaults;

      /**
       * Helpers
       */
      var escapeTest = /[&<>"']/;
      var escapeReplace = /[&<>"']/g;
      var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
      var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
      var escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      var getEscapeReplacement = function getEscapeReplacement(ch) {
        return escapeReplacements[ch];
      };

      function escape(html, encode) {
        if (encode) {
          if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
          }
        } else {
          if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
        }

        return html;
      }

      var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

      function unescape(html) {
        // explicitly match decimal, hex, and named HTML entities
        return html.replace(unescapeTest, function (_, n) {
          n = n.toLowerCase();
          if (n === 'colon') return ':';

          if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
          }

          return '';
        });
      }

      var caret = /(^|[^\[])\^/g;

      function edit(regex, opt) {
        regex = regex.source || regex;
        opt = opt || '';
        var obj = {
          replace: function replace(name, val) {
            val = val.source || val;
            val = val.replace(caret, '$1');
            regex = regex.replace(name, val);
            return obj;
          },
          getRegex: function getRegex() {
            return new RegExp(regex, opt);
          }
        };
        return obj;
      }

      var nonWordAndColonTest = /[^\w:]/g;
      var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

      function cleanUrl(sanitize, base, href) {
        if (sanitize) {
          var prot;

          try {
            prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
          } catch (e) {
            return null;
          }

          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
          }
        }

        if (base && !originIndependentUrl.test(href)) {
          href = resolveUrl(base, href);
        }

        try {
          href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
          return null;
        }

        return href;
      }

      var baseUrls = {};
      var justDomain = /^[^:]+:\/*[^/]*$/;
      var protocol = /^([^:]+:)[\s\S]*$/;
      var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

      function resolveUrl(base, href) {
        if (!baseUrls[' ' + base]) {
          // we can ignore everything in base after the last slash of its path component,
          // but we might need to add _that_
          // https://tools.ietf.org/html/rfc3986#section-3
          if (justDomain.test(base)) {
            baseUrls[' ' + base] = base + '/';
          } else {
            baseUrls[' ' + base] = rtrim(base, '/', true);
          }
        }

        base = baseUrls[' ' + base];
        var relativeBase = base.indexOf(':') === -1;

        if (href.substring(0, 2) === '//') {
          if (relativeBase) {
            return href;
          }

          return base.replace(protocol, '$1') + href;
        } else if (href.charAt(0) === '/') {
          if (relativeBase) {
            return href;
          }

          return base.replace(domain, '$1') + href;
        } else {
          return base + href;
        }
      }

      var noopTest = {
        exec: function noopTest() {}
      };

      function merge(obj) {
        var i = 1,
            target,
            key;

        for (; i < arguments.length; i++) {
          target = arguments[i];

          for (key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
              obj[key] = target[key];
            }
          }
        }

        return obj;
      }

      function splitCells(tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
          var escaped = false,
              curr = offset;

          while (--curr >= 0 && str[curr] === '\\') {
            escaped = !escaped;
          }

          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
            cells = row.split(/ \|/);
        var i = 0;

        if (cells.length > count) {
          cells.splice(count);
        } else {
          while (cells.length < count) {
            cells.push('');
          }
        }

        for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
      } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
      // /c*$/ is vulnerable to REDOS.
      // invert: Remove suffix of non-c chars instead. Default falsey.


      function rtrim(str, c, invert) {
        var l = str.length;

        if (l === 0) {
          return '';
        } // Length of suffix matching the invert condition.


        var suffLen = 0; // Step left until we fail to match the invert condition.

        while (suffLen < l) {
          var currChar = str.charAt(l - suffLen - 1);

          if (currChar === c && !invert) {
            suffLen++;
          } else if (currChar !== c && invert) {
            suffLen++;
          } else {
            break;
          }
        }

        return str.substr(0, l - suffLen);
      }

      function findClosingBracket(str, b) {
        if (str.indexOf(b[1]) === -1) {
          return -1;
        }

        var l = str.length;
        var level = 0,
            i = 0;

        for (; i < l; i++) {
          if (str[i] === '\\') {
            i++;
          } else if (str[i] === b[0]) {
            level++;
          } else if (str[i] === b[1]) {
            level--;

            if (level < 0) {
              return i;
            }
          }
        }

        return -1;
      }

      function checkSanitizeDeprecation(opt) {
        if (opt && opt.sanitize && !opt.silent) {
          console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
        }
      } // copied from https://stackoverflow.com/a/5450113/806777


      function repeatString(pattern, count) {
        if (count < 1) {
          return '';
        }

        var result = '';

        while (count > 1) {
          if (count & 1) {
            result += pattern;
          }

          count >>= 1;
          pattern += pattern;
        }

        return result + pattern;
      }

      var helpers = {
        escape: escape,
        unescape: unescape,
        edit: edit,
        cleanUrl: cleanUrl,
        resolveUrl: resolveUrl,
        noopTest: noopTest,
        merge: merge,
        splitCells: splitCells,
        rtrim: rtrim,
        findClosingBracket: findClosingBracket,
        checkSanitizeDeprecation: checkSanitizeDeprecation,
        repeatString: repeatString
      };

      var defaults$1 = defaults.defaults;
      var rtrim$1 = helpers.rtrim,
          splitCells$1 = helpers.splitCells,
          _escape = helpers.escape,
          findClosingBracket$1 = helpers.findClosingBracket;

      function outputLink(cap, link, raw) {
        var href = link.href;
        var title = link.title ? _escape(link.title) : null;
        var text = cap[1].replace(/\\([\[\]])/g, '$1');

        if (cap[0].charAt(0) !== '!') {
          return {
            type: 'link',
            raw: raw,
            href: href,
            title: title,
            text: text
          };
        } else {
          return {
            type: 'image',
            raw: raw,
            href: href,
            title: title,
            text: _escape(text)
          };
        }
      }

      function indentCodeCompensation(raw, text) {
        var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

        if (matchIndentToCode === null) {
          return text;
        }

        var indentToCode = matchIndentToCode[1];
        return text.split('\n').map(function (node) {
          var matchIndentInNode = node.match(/^\s+/);

          if (matchIndentInNode === null) {
            return node;
          }

          var indentInNode = matchIndentInNode[0];

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        }).join('\n');
      }
      /**
       * Tokenizer
       */


      var Tokenizer_1 = /*#__PURE__*/function () {
        function Tokenizer(options) {
          this.options = options || defaults$1;
        }

        var _proto = Tokenizer.prototype;

        _proto.space = function space(src) {
          var cap = this.rules.block.newline.exec(src);

          if (cap) {
            if (cap[0].length > 1) {
              return {
                type: 'space',
                raw: cap[0]
              };
            }

            return {
              raw: '\n'
            };
          }
        };

        _proto.code = function code(src, tokens) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

            if (lastToken && lastToken.type === 'paragraph') {
              return {
                raw: cap[0],
                text: cap[0].trimRight()
              };
            }

            var text = cap[0].replace(/^ {4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic ? rtrim$1(text, '\n') : text
            };
          }
        };

        _proto.fences = function fences(src) {
          var cap = this.rules.block.fences.exec(src);

          if (cap) {
            var raw = cap[0];
            var text = indentCodeCompensation(raw, cap[3] || '');
            return {
              type: 'code',
              raw: raw,
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: text
            };
          }
        };

        _proto.heading = function heading(src) {
          var cap = this.rules.block.heading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[1].length,
              text: cap[2]
            };
          }
        };

        _proto.nptable = function nptable(src) {
          var cap = this.rules.block.nptable.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
              raw: cap[0]
            };

            if (item.header.length === item.align.length) {
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells$1(item.cells[i], item.header.length);
              }

              return item;
            }
          }
        };

        _proto.hr = function hr(src) {
          var cap = this.rules.block.hr.exec(src);

          if (cap) {
            return {
              type: 'hr',
              raw: cap[0]
            };
          }
        };

        _proto.blockquote = function blockquote(src) {
          var cap = this.rules.block.blockquote.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ *> ?/gm, '');
            return {
              type: 'blockquote',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.list = function list(src) {
          var cap = this.rules.block.list.exec(src);

          if (cap) {
            var raw = cap[0];
            var bull = cap[2];
            var isordered = bull.length > 1;
            var list = {
              type: 'list',
              raw: raw,
              ordered: isordered,
              start: isordered ? +bull.slice(0, -1) : '',
              loose: false,
              items: []
            }; // Get each top-level item.

            var itemMatch = cap[0].match(this.rules.block.item);
            var next = false,
                item,
                space,
                bcurr,
                bnext,
                addBack,
                loose,
                istask,
                ischecked;
            var l = itemMatch.length;
            bcurr = this.rules.block.listItemStart.exec(itemMatch[0]);

            for (var i = 0; i < l; i++) {
              item = itemMatch[i];
              raw = item; // Determine whether the next list item belongs here.
              // Backpedal if it does not belong in this list.

              if (i !== l - 1) {
                bnext = this.rules.block.listItemStart.exec(itemMatch[i + 1]);

                if (bnext[1].length > bcurr[0].length || bnext[1].length > 3) {
                  // nested list
                  itemMatch.splice(i, 2, itemMatch[i] + '\n' + itemMatch[i + 1]);
                  i--;
                  l--;
                  continue;
                } else {
                  if ( // different bullet style
                  !this.options.pedantic || this.options.smartLists ? bnext[2][bnext[2].length - 1] !== bull[bull.length - 1] : isordered === (bnext[2].length === 1)) {
                    addBack = itemMatch.slice(i + 1).join('\n');
                    list.raw = list.raw.substring(0, list.raw.length - addBack.length);
                    i = l - 1;
                  }
                }

                bcurr = bnext;
              } // Remove the list item's bullet
              // so it is seen as the next token.


              space = item.length;
              item = item.replace(/^ *([*+-]|\d+[.)]) ?/, ''); // Outdent whatever the
              // list item contains. Hacky.

              if (~item.indexOf('\n ')) {
                space -= item.length;
                item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
              } // Determine whether item is loose or not.
              // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
              // for discount behavior.


              loose = next || /\n\n(?!\s*$)/.test(item);

              if (i !== l - 1) {
                next = item.charAt(item.length - 1) === '\n';
                if (!loose) loose = next;
              }

              if (loose) {
                list.loose = true;
              } // Check for task list items


              istask = /^\[[ xX]\] /.test(item);
              ischecked = undefined;

              if (istask) {
                ischecked = item[1] !== ' ';
                item = item.replace(/^\[[ xX]\] +/, '');
              }

              list.items.push({
                type: 'list_item',
                raw: raw,
                task: istask,
                checked: ischecked,
                loose: loose,
                text: item
              });
            }

            return list;
          }
        };

        _proto.html = function html(src) {
          var cap = this.rules.block.html.exec(src);

          if (cap) {
            return {
              type: this.options.sanitize ? 'paragraph' : 'html',
              raw: cap[0],
              pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.def = function def(src) {
          var cap = this.rules.block.def.exec(src);

          if (cap) {
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            return {
              tag: tag,
              raw: cap[0],
              href: cap[2],
              title: cap[3]
            };
          }
        };

        _proto.table = function table(src) {
          var cap = this.rules.block.table.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              item.raw = cap[0];
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells$1(item.cells[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
              }

              return item;
            }
          }
        };

        _proto.lheading = function lheading(src) {
          var cap = this.rules.block.lheading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            };
          }
        };

        _proto.paragraph = function paragraph(src) {
          var cap = this.rules.block.paragraph.exec(src);

          if (cap) {
            return {
              type: 'paragraph',
              raw: cap[0],
              text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
            };
          }
        };

        _proto.text = function text(src, tokens) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
            var lastToken = tokens[tokens.length - 1];

            if (lastToken && lastToken.type === 'text') {
              return {
                raw: cap[0],
                text: cap[0]
              };
            }

            return {
              type: 'text',
              raw: cap[0],
              text: cap[0]
            };
          }
        };

        _proto.escape = function escape(src) {
          var cap = this.rules.inline.escape.exec(src);

          if (cap) {
            return {
              type: 'escape',
              raw: cap[0],
              text: _escape(cap[1])
            };
          }
        };

        _proto.tag = function tag(src, inLink, inRawBlock) {
          var cap = this.rules.inline.tag.exec(src);

          if (cap) {
            if (!inLink && /^<a /i.test(cap[0])) {
              inLink = true;
            } else if (inLink && /^<\/a>/i.test(cap[0])) {
              inLink = false;
            }

            if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = true;
            } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = false;
            }

            return {
              type: this.options.sanitize ? 'text' : 'html',
              raw: cap[0],
              inLink: inLink,
              inRawBlock: inRawBlock,
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.link = function link(src) {
          var cap = this.rules.inline.link.exec(src);

          if (cap) {
            var lastParenIndex = findClosingBracket$1(cap[2], '()');

            if (lastParenIndex > -1) {
              var start = cap[0].indexOf('!') === 0 ? 5 : 4;
              var linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }

            var href = cap[2];
            var title = '';

            if (this.options.pedantic) {
              var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              } else {
                title = '';
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }

            href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
            var token = outputLink(cap, {
              href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
              title: title ? title.replace(this.rules.inline._escapes, '$1') : title
            }, cap[0]);
            return token;
          }
        };

        _proto.reflink = function reflink(src, links) {
          var cap;

          if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
            var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = links[link.toLowerCase()];

            if (!link || !link.href) {
              var text = cap[0].charAt(0);
              return {
                type: 'text',
                raw: text,
                text: text
              };
            }

            var token = outputLink(cap, link, cap[0]);
            return token;
          }
        };

        _proto.strong = function strong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.strong.start.exec(src);

          if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
            maskedSrc = maskedSrc.slice(-1 * src.length);
            var endReg = match[0] === '**' ? this.rules.inline.strong.endAst : this.rules.inline.strong.endUnd;
            endReg.lastIndex = 0;
            var cap;

            while ((match = endReg.exec(maskedSrc)) != null) {
              cap = this.rules.inline.strong.middle.exec(maskedSrc.slice(0, match.index + 3));

              if (cap) {
                return {
                  type: 'strong',
                  raw: src.slice(0, cap[0].length),
                  text: src.slice(2, cap[0].length - 2)
                };
              }
            }
          }
        };

        _proto.em = function em(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.em.start.exec(src);

          if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
            maskedSrc = maskedSrc.slice(-1 * src.length);
            var endReg = match[0] === '*' ? this.rules.inline.em.endAst : this.rules.inline.em.endUnd;
            endReg.lastIndex = 0;
            var cap;

            while ((match = endReg.exec(maskedSrc)) != null) {
              cap = this.rules.inline.em.middle.exec(maskedSrc.slice(0, match.index + 2));

              if (cap) {
                return {
                  type: 'em',
                  raw: src.slice(0, cap[0].length),
                  text: src.slice(1, cap[0].length - 1)
                };
              }
            }
          }
        };

        _proto.codespan = function codespan(src) {
          var cap = this.rules.inline.code.exec(src);

          if (cap) {
            var text = cap[2].replace(/\n/g, ' ');
            var hasNonSpaceChars = /[^ ]/.test(text);
            var hasSpaceCharsOnBothEnds = text.startsWith(' ') && text.endsWith(' ');

            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
              text = text.substring(1, text.length - 1);
            }

            text = _escape(text, true);
            return {
              type: 'codespan',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.br = function br(src) {
          var cap = this.rules.inline.br.exec(src);

          if (cap) {
            return {
              type: 'br',
              raw: cap[0]
            };
          }
        };

        _proto.del = function del(src) {
          var cap = this.rules.inline.del.exec(src);

          if (cap) {
            return {
              type: 'del',
              raw: cap[0],
              text: cap[2]
            };
          }
        };

        _proto.autolink = function autolink(src, mangle) {
          var cap = this.rules.inline.autolink.exec(src);

          if (cap) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
              href = 'mailto:' + text;
            } else {
              text = _escape(cap[1]);
              href = text;
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.url = function url(src, mangle) {
          var cap;

          if (cap = this.rules.inline.url.exec(src)) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              var prevCapZero;

              do {
                prevCapZero = cap[0];
                cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);

              text = _escape(cap[0]);

              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.inlineText = function inlineText(src, inRawBlock, smartypants) {
          var cap = this.rules.inline.text.exec(src);

          if (cap) {
            var text;

            if (inRawBlock) {
              text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
            } else {
              text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
            }

            return {
              type: 'text',
              raw: cap[0],
              text: text
            };
          }
        };

        return Tokenizer;
      }();

      var noopTest$1 = helpers.noopTest,
          edit$1 = helpers.edit,
          merge$1 = helpers.merge;
      /**
       * Block-Level Grammar
       */

      var block = {
        newline: /^\n+/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
        hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
        heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?! {0,3}bull )\n*|\s*$)/,
        html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
        def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
        nptable: noopTest$1,
        table: noopTest$1,
        lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
        // regex template, placeholders will be replaced according to different paragraph
        // interruption rules of commonmark and the original markdown spec:
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
        text: /^[^\n]+/
      };
      block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
      block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
      block.def = edit$1(block.def).replace('label', block._label).replace('title', block._title).getRegex();
      block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
      block.item = /^( *)(bull) ?[^\n]*(?:\n(?! *bull ?)[^\n]*)*/;
      block.item = edit$1(block.item, 'gm').replace(/bull/g, block.bullet).getRegex();
      block.listItemStart = edit$1(/^( *)(bull)/).replace('bull', block.bullet).getRegex();
      block.list = edit$1(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
      block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
      block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
      block.html = edit$1(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
      block.paragraph = edit$1(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      block.blockquote = edit$1(block.blockquote).replace('paragraph', block.paragraph).getRegex();
      /**
       * Normal Block Grammar
       */

      block.normal = merge$1({}, block);
      /**
       * GFM Block Grammar
       */

      block.gfm = merge$1({}, block.normal, {
        nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
        + ' {0,3}([-:]+ *\\|[-| :]*)' // Align
        + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
        // Cells
        table: '^ *\\|(.+)\\n' // Header
        + ' {0,3}\\|?( *[-:]+[-| :]*)' // Align
        + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

      });
      block.gfm.nptable = edit$1(block.gfm.nptable).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      block.gfm.table = edit$1(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      /**
       * Pedantic grammar (original John Gruber's loose markdown specification)
       */

      block.pedantic = merge$1({}, block.normal, {
        html: edit$1('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
        fences: noopTest$1,
        // fences not supported
        paragraph: edit$1(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
      });
      /**
       * Inline-Level Grammar
       */

      var inline = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: noopTest$1,
        tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
        // CDATA section
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
        nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
        reflinkSearch: 'reflink|nolink(?!\\()',
        strong: {
          start: /^(?:(\*\*(?=[*punctuation]))|\*\*)(?![\s])|__/,
          // (1) returns if starts w/ punctuation
          middle: /^\*\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?)__$/,
          endAst: /[^punctuation\s]\*\*(?!\*)|[punctuation]\*\*(?!\*)(?:(?=[punctuation_\s]|$))/,
          // last char can't be punct, or final * must also be followed by punct (or endline)
          endUnd: /[^\s]__(?!_)(?:(?=[punctuation*\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

        },
        em: {
          start: /^(?:(\*(?=[punctuation]))|\*)(?![*\s])|_/,
          // (1) returns if starts w/ punctuation
          middle: /^\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?_$/,
          endAst: /[^punctuation\s]\*(?!\*)|[punctuation]\*(?!\*)(?:(?=[punctuation_\s]|$))/,
          // last char can't be punct, or final * must also be followed by punct (or endline)
          endUnd: /[^\s]_(?!_)(?:(?=[punctuation*\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest$1,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\s*punctuation])/
      }; // list of punctuation marks from common mark spec
      // without * and _ to workaround cases with double emphasis

      inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline.punctuation = edit$1(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline._blockSkip = '\\[[^\\]]*?\\]\\([^\\)]*?\\)|`[^`]*?`|<[^>]*?>';
      inline._overlapSkip = '__[^_]*?__|\\*\\*\\[^\\*\\]*?\\*\\*';
      inline._comment = edit$1(block._comment).replace('(?:-->|$)', '-->').getRegex();
      inline.em.start = edit$1(inline.em.start).replace(/punctuation/g, inline._punctuation).getRegex();
      inline.em.middle = edit$1(inline.em.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
      inline.em.endAst = edit$1(inline.em.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.em.endUnd = edit$1(inline.em.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.start = edit$1(inline.strong.start).replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.middle = edit$1(inline.strong.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
      inline.strong.endAst = edit$1(inline.strong.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.endUnd = edit$1(inline.strong.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.blockSkip = edit$1(inline._blockSkip, 'g').getRegex();
      inline.overlapSkip = edit$1(inline._overlapSkip, 'g').getRegex();
      inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
      inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
      inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
      inline.autolink = edit$1(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
      inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
      inline.tag = edit$1(inline.tag).replace('comment', inline._comment).replace('attribute', inline._attribute).getRegex();
      inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
      inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
      inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
      inline.link = edit$1(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
      inline.reflink = edit$1(inline.reflink).replace('label', inline._label).getRegex();
      inline.reflinkSearch = edit$1(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
      /**
       * Normal Inline Grammar
       */

      inline.normal = merge$1({}, inline);
      /**
       * Pedantic Inline Grammar
       */

      inline.pedantic = merge$1({}, inline.normal, {
        strong: {
          start: /^__|\*\*/,
          middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g
        },
        link: edit$1(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
        reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
      });
      /**
       * GFM Inline Grammar
       */

      inline.gfm = merge$1({}, inline.normal, {
        escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
        _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
      });
      inline.gfm.url = edit$1(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
      /**
       * GFM + Line Breaks Inline Grammar
       */

      inline.breaks = merge$1({}, inline.gfm, {
        br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
        text: edit$1(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
      });
      var rules = {
        block: block,
        inline: inline
      };

      var defaults$2 = defaults.defaults;
      var block$1 = rules.block,
          inline$1 = rules.inline;
      var repeatString$1 = helpers.repeatString;
      /**
       * smartypants text replacement
       */

      function smartypants(text) {
        return text // em-dashes
        .replace(/---/g, "\u2014") // en-dashes
        .replace(/--/g, "\u2013") // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
        .replace(/'/g, "\u2019") // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
        .replace(/"/g, "\u201D") // ellipses
        .replace(/\.{3}/g, "\u2026");
      }
      /**
       * mangle email addresses
       */


      function mangle(text) {
        var out = '',
            i,
            ch;
        var l = text.length;

        for (i = 0; i < l; i++) {
          ch = text.charCodeAt(i);

          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }

          out += '&#' + ch + ';';
        }

        return out;
      }
      /**
       * Block Lexer
       */


      var Lexer_1 = /*#__PURE__*/function () {
        function Lexer(options) {
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || defaults$2;
          this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          var rules = {
            block: block$1.normal,
            inline: inline$1.normal
          };

          if (this.options.pedantic) {
            rules.block = block$1.pedantic;
            rules.inline = inline$1.pedantic;
          } else if (this.options.gfm) {
            rules.block = block$1.gfm;

            if (this.options.breaks) {
              rules.inline = inline$1.breaks;
            } else {
              rules.inline = inline$1.gfm;
            }
          }

          this.tokenizer.rules = rules;
        }
        /**
         * Expose Rules
         */


        /**
         * Static Lex Method
         */
        Lexer.lex = function lex(src, options) {
          var lexer = new Lexer(options);
          return lexer.lex(src);
        }
        /**
         * Static Lex Inline Method
         */
        ;

        Lexer.lexInline = function lexInline(src, options) {
          var lexer = new Lexer(options);
          return lexer.inlineTokens(src);
        }
        /**
         * Preprocessing
         */
        ;

        var _proto = Lexer.prototype;

        _proto.lex = function lex(src) {
          src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
          this.blockTokens(src, this.tokens, true);
          this.inline(this.tokens);
          return this.tokens;
        }
        /**
         * Lexing
         */
        ;

        _proto.blockTokens = function blockTokens(src, tokens, top) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (top === void 0) {
            top = true;
          }

          src = src.replace(/^ +$/gm, '');
          var token, i, l, lastToken;

          while (src) {
            // newline
            if (token = this.tokenizer.space(src)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              }

              continue;
            } // code


            if (token = this.tokenizer.code(src, tokens)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              } else {
                lastToken = tokens[tokens.length - 1];
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              }

              continue;
            } // fences


            if (token = this.tokenizer.fences(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // heading


            if (token = this.tokenizer.heading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // table no leading pipe (gfm)


            if (token = this.tokenizer.nptable(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // hr


            if (token = this.tokenizer.hr(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // blockquote


            if (token = this.tokenizer.blockquote(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.blockTokens(token.text, [], top);
              tokens.push(token);
              continue;
            } // list


            if (token = this.tokenizer.list(src)) {
              src = src.substring(token.raw.length);
              l = token.items.length;

              for (i = 0; i < l; i++) {
                token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
              }

              tokens.push(token);
              continue;
            } // html


            if (token = this.tokenizer.html(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // def


            if (top && (token = this.tokenizer.def(src))) {
              src = src.substring(token.raw.length);

              if (!this.tokens.links[token.tag]) {
                this.tokens.links[token.tag] = {
                  href: token.href,
                  title: token.title
                };
              }

              continue;
            } // table (gfm)


            if (token = this.tokenizer.table(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // lheading


            if (token = this.tokenizer.lheading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // top-level paragraph


            if (top && (token = this.tokenizer.paragraph(src))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.text(src, tokens)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              } else {
                lastToken = tokens[tokens.length - 1];
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _proto.inline = function inline(tokens) {
          var i, j, k, l2, row, token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'paragraph':
              case 'text':
              case 'heading':
                {
                  token.tokens = [];
                  this.inlineTokens(token.text, token.tokens);
                  break;
                }

              case 'table':
                {
                  token.tokens = {
                    header: [],
                    cells: []
                  }; // header

                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    token.tokens.header[j] = [];
                    this.inlineTokens(token.header[j], token.tokens.header[j]);
                  } // cells


                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.cells[j];
                    token.tokens.cells[j] = [];

                    for (k = 0; k < row.length; k++) {
                      token.tokens.cells[j][k] = [];
                      this.inlineTokens(row[k], token.tokens.cells[j][k]);
                    }
                  }

                  break;
                }

              case 'blockquote':
                {
                  this.inline(token.tokens);
                  break;
                }

              case 'list':
                {
                  l2 = token.items.length;

                  for (j = 0; j < l2; j++) {
                    this.inline(token.items[j].tokens);
                  }

                  break;
                }
            }
          }

          return tokens;
        }
        /**
         * Lexing/Compiling
         */
        ;

        _proto.inlineTokens = function inlineTokens(src, tokens, inLink, inRawBlock, prevChar) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (inLink === void 0) {
            inLink = false;
          }

          if (inRawBlock === void 0) {
            inRawBlock = false;
          }

          if (prevChar === void 0) {
            prevChar = '';
          }

          var token; // String with links masked to avoid interference with em and strong

          var maskedSrc = src;
          var match; // Mask out reflinks

          if (this.tokens.links) {
            var links = Object.keys(this.tokens.links);

            if (links.length > 0) {
              while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                  maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString$1('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                }
              }
            }
          } // Mask out other blocks


          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString$1('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          }

          while (src) {
            // escape
            if (token = this.tokenizer.escape(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // tag


            if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
              src = src.substring(token.raw.length);
              inLink = token.inLink;
              inRawBlock = token.inRawBlock;
              tokens.push(token);
              continue;
            } // link


            if (token = this.tokenizer.link(src)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // reflink, nolink


            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // strong


            if (token = this.tokenizer.strong(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // em


            if (token = this.tokenizer.em(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // code


            if (token = this.tokenizer.codespan(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // br


            if (token = this.tokenizer.br(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // del (gfm)


            if (token = this.tokenizer.del(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // autolink


            if (token = this.tokenizer.autolink(src, mangle)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // url (gfm)


            if (!inLink && (token = this.tokenizer.url(src, mangle))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
              src = src.substring(token.raw.length);
              prevChar = token.raw.slice(-1);
              tokens.push(token);
              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _createClass(Lexer, null, [{
          key: "rules",
          get: function get() {
            return {
              block: block$1,
              inline: inline$1
            };
          }
        }]);

        return Lexer;
      }();

      var defaults$3 = defaults.defaults;
      var cleanUrl$1 = helpers.cleanUrl,
          escape$1 = helpers.escape;
      /**
       * Renderer
       */

      var Renderer_1 = /*#__PURE__*/function () {
        function Renderer(options) {
          this.options = options || defaults$3;
        }

        var _proto = Renderer.prototype;

        _proto.code = function code(_code, infostring, escaped) {
          var lang = (infostring || '').match(/\S*/)[0];

          if (this.options.highlight) {
            var out = this.options.highlight(_code, lang);

            if (out != null && out !== _code) {
              escaped = true;
              _code = out;
            }
          }

          if (!lang) {
            return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
          }

          return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
        };

        _proto.blockquote = function blockquote(quote) {
          return '<blockquote>\n' + quote + '</blockquote>\n';
        };

        _proto.html = function html(_html) {
          return _html;
        };

        _proto.heading = function heading(text, level, raw, slugger) {
          if (this.options.headerIds) {
            return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
          } // ignore IDs


          return '<h' + level + '>' + text + '</h' + level + '>\n';
        };

        _proto.hr = function hr() {
          return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
        };

        _proto.list = function list(body, ordered, start) {
          var type = ordered ? 'ol' : 'ul',
              startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
          return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
        };

        _proto.listitem = function listitem(text) {
          return '<li>' + text + '</li>\n';
        };

        _proto.checkbox = function checkbox(checked) {
          return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
        };

        _proto.paragraph = function paragraph(text) {
          return '<p>' + text + '</p>\n';
        };

        _proto.table = function table(header, body) {
          if (body) body = '<tbody>' + body + '</tbody>';
          return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
        };

        _proto.tablerow = function tablerow(content) {
          return '<tr>\n' + content + '</tr>\n';
        };

        _proto.tablecell = function tablecell(content, flags) {
          var type = flags.header ? 'th' : 'td';
          var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
          return tag + content + '</' + type + '>\n';
        } // span level renderer
        ;

        _proto.strong = function strong(text) {
          return '<strong>' + text + '</strong>';
        };

        _proto.em = function em(text) {
          return '<em>' + text + '</em>';
        };

        _proto.codespan = function codespan(text) {
          return '<code>' + text + '</code>';
        };

        _proto.br = function br() {
          return this.options.xhtml ? '<br/>' : '<br>';
        };

        _proto.del = function del(text) {
          return '<del>' + text + '</del>';
        };

        _proto.link = function link(href, title, text) {
          href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<a href="' + escape$1(href) + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += '>' + text + '</a>';
          return out;
        };

        _proto.image = function image(href, title, text) {
          href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<img src="' + href + '" alt="' + text + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        return Renderer;
      }();

      /**
       * TextRenderer
       * returns only the textual part of the token
       */
      var TextRenderer_1 = /*#__PURE__*/function () {
        function TextRenderer() {}

        var _proto = TextRenderer.prototype;

        // no need for block level renderers
        _proto.strong = function strong(text) {
          return text;
        };

        _proto.em = function em(text) {
          return text;
        };

        _proto.codespan = function codespan(text) {
          return text;
        };

        _proto.del = function del(text) {
          return text;
        };

        _proto.html = function html(text) {
          return text;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        _proto.link = function link(href, title, text) {
          return '' + text;
        };

        _proto.image = function image(href, title, text) {
          return '' + text;
        };

        _proto.br = function br() {
          return '';
        };

        return TextRenderer;
      }();

      /**
       * Slugger generates header id
       */
      var Slugger_1 = /*#__PURE__*/function () {
        function Slugger() {
          this.seen = {};
        }

        var _proto = Slugger.prototype;

        _proto.serialize = function serialize(value) {
          return value.toLowerCase().trim() // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
        }
        /**
         * Finds the next safe (unique) slug to use
         */
        ;

        _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
          var slug = originalSlug;
          var occurenceAccumulator = 0;

          if (this.seen.hasOwnProperty(slug)) {
            occurenceAccumulator = this.seen[originalSlug];

            do {
              occurenceAccumulator++;
              slug = originalSlug + '-' + occurenceAccumulator;
            } while (this.seen.hasOwnProperty(slug));
          }

          if (!isDryRun) {
            this.seen[originalSlug] = occurenceAccumulator;
            this.seen[slug] = 0;
          }

          return slug;
        }
        /**
         * Convert string to unique id
         * @param {object} options
         * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
         */
        ;

        _proto.slug = function slug(value, options) {
          if (options === void 0) {
            options = {};
          }

          var slug = this.serialize(value);
          return this.getNextSafeSlug(slug, options.dryrun);
        };

        return Slugger;
      }();

      var defaults$4 = defaults.defaults;
      var unescape$1 = helpers.unescape;
      /**
       * Parsing & Compiling
       */

      var Parser_1 = /*#__PURE__*/function () {
        function Parser(options) {
          this.options = options || defaults$4;
          this.options.renderer = this.options.renderer || new Renderer_1();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.textRenderer = new TextRenderer_1();
          this.slugger = new Slugger_1();
        }
        /**
         * Static Parse Method
         */


        Parser.parse = function parse(tokens, options) {
          var parser = new Parser(options);
          return parser.parse(tokens);
        }
        /**
         * Static Parse Inline Method
         */
        ;

        Parser.parseInline = function parseInline(tokens, options) {
          var parser = new Parser(options);
          return parser.parseInline(tokens);
        }
        /**
         * Parse Loop
         */
        ;

        var _proto = Parser.prototype;

        _proto.parse = function parse(tokens, top) {
          if (top === void 0) {
            top = true;
          }

          var out = '',
              i,
              j,
              k,
              l2,
              l3,
              row,
              cell,
              header,
              body,
              token,
              ordered,
              start,
              loose,
              itemBody,
              item,
              checked,
              task,
              checkbox;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'space':
                {
                  continue;
                }

              case 'hr':
                {
                  out += this.renderer.hr();
                  continue;
                }

              case 'heading':
                {
                  out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape$1(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
                  continue;
                }

              case 'code':
                {
                  out += this.renderer.code(token.text, token.lang, token.escaped);
                  continue;
                }

              case 'table':
                {
                  header = ''; // header

                  cell = '';
                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    cell += this.renderer.tablecell(this.parseInline(token.tokens.header[j]), {
                      header: true,
                      align: token.align[j]
                    });
                  }

                  header += this.renderer.tablerow(cell);
                  body = '';
                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.tokens.cells[j];
                    cell = '';
                    l3 = row.length;

                    for (k = 0; k < l3; k++) {
                      cell += this.renderer.tablecell(this.parseInline(row[k]), {
                        header: false,
                        align: token.align[k]
                      });
                    }

                    body += this.renderer.tablerow(cell);
                  }

                  out += this.renderer.table(header, body);
                  continue;
                }

              case 'blockquote':
                {
                  body = this.parse(token.tokens);
                  out += this.renderer.blockquote(body);
                  continue;
                }

              case 'list':
                {
                  ordered = token.ordered;
                  start = token.start;
                  loose = token.loose;
                  l2 = token.items.length;
                  body = '';

                  for (j = 0; j < l2; j++) {
                    item = token.items[j];
                    checked = item.checked;
                    task = item.task;
                    itemBody = '';

                    if (item.task) {
                      checkbox = this.renderer.checkbox(checked);

                      if (loose) {
                        if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                            item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                          }
                        } else {
                          item.tokens.unshift({
                            type: 'text',
                            text: checkbox
                          });
                        }
                      } else {
                        itemBody += checkbox;
                      }
                    }

                    itemBody += this.parse(item.tokens, loose);
                    body += this.renderer.listitem(itemBody, task, checked);
                  }

                  out += this.renderer.list(body, ordered, start);
                  continue;
                }

              case 'html':
                {
                  // TODO parse inline content if parameter markdown=1
                  out += this.renderer.html(token.text);
                  continue;
                }

              case 'paragraph':
                {
                  out += this.renderer.paragraph(this.parseInline(token.tokens));
                  continue;
                }

              case 'text':
                {
                  body = token.tokens ? this.parseInline(token.tokens) : token.text;

                  while (i + 1 < l && tokens[i + 1].type === 'text') {
                    token = tokens[++i];
                    body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
                  }

                  out += top ? this.renderer.paragraph(body) : body;
                  continue;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        }
        /**
         * Parse Inline Tokens
         */
        ;

        _proto.parseInline = function parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          var out = '',
              i,
              token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'escape':
                {
                  out += renderer.text(token.text);
                  break;
                }

              case 'html':
                {
                  out += renderer.html(token.text);
                  break;
                }

              case 'link':
                {
                  out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'image':
                {
                  out += renderer.image(token.href, token.title, token.text);
                  break;
                }

              case 'strong':
                {
                  out += renderer.strong(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'em':
                {
                  out += renderer.em(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'codespan':
                {
                  out += renderer.codespan(token.text);
                  break;
                }

              case 'br':
                {
                  out += renderer.br();
                  break;
                }

              case 'del':
                {
                  out += renderer.del(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'text':
                {
                  out += renderer.text(token.text);
                  break;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        };

        return Parser;
      }();

      var merge$2 = helpers.merge,
          checkSanitizeDeprecation$1 = helpers.checkSanitizeDeprecation,
          escape$2 = helpers.escape;
      var getDefaults = defaults.getDefaults,
          changeDefaults = defaults.changeDefaults,
          defaults$5 = defaults.defaults;
      /**
       * Marked
       */

      function marked(src, opt, callback) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        if (typeof opt === 'function') {
          callback = opt;
          opt = null;
        }

        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);

        if (callback) {
          var highlight = opt.highlight;
          var tokens;

          try {
            tokens = Lexer_1.lex(src, opt);
          } catch (e) {
            return callback(e);
          }

          var done = function done(err) {
            var out;

            if (!err) {
              try {
                out = Parser_1.parse(tokens, opt);
              } catch (e) {
                err = e;
              }
            }

            opt.highlight = highlight;
            return err ? callback(err) : callback(null, out);
          };

          if (!highlight || highlight.length < 3) {
            return done();
          }

          delete opt.highlight;
          if (!tokens.length) return done();
          var pending = 0;
          marked.walkTokens(tokens, function (token) {
            if (token.type === 'code') {
              pending++;
              setTimeout(function () {
                highlight(token.text, token.lang, function (err, code) {
                  if (err) {
                    return done(err);
                  }

                  if (code != null && code !== token.text) {
                    token.text = code;
                    token.escaped = true;
                  }

                  pending--;

                  if (pending === 0) {
                    done();
                  }
                });
              }, 0);
            }
          });

          if (pending === 0) {
            done();
          }

          return;
        }

        try {
          var _tokens = Lexer_1.lex(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(_tokens, opt.walkTokens);
          }

          return Parser_1.parse(_tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      }
      /**
       * Options
       */


      marked.options = marked.setOptions = function (opt) {
        merge$2(marked.defaults, opt);
        changeDefaults(marked.defaults);
        return marked;
      };

      marked.getDefaults = getDefaults;
      marked.defaults = defaults$5;
      /**
       * Use Extension
       */

      marked.use = function (extension) {
        var opts = merge$2({}, extension);

        if (extension.renderer) {
          (function () {
            var renderer = marked.defaults.renderer || new Renderer_1();

            var _loop = function _loop(prop) {
              var prevRenderer = renderer[prop];

              renderer[prop] = function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                var ret = extension.renderer[prop].apply(renderer, args);

                if (ret === false) {
                  ret = prevRenderer.apply(renderer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.renderer) {
              _loop(prop);
            }

            opts.renderer = renderer;
          })();
        }

        if (extension.tokenizer) {
          (function () {
            var tokenizer = marked.defaults.tokenizer || new Tokenizer_1();

            var _loop2 = function _loop2(prop) {
              var prevTokenizer = tokenizer[prop];

              tokenizer[prop] = function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                var ret = extension.tokenizer[prop].apply(tokenizer, args);

                if (ret === false) {
                  ret = prevTokenizer.apply(tokenizer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.tokenizer) {
              _loop2(prop);
            }

            opts.tokenizer = tokenizer;
          })();
        }

        if (extension.walkTokens) {
          var walkTokens = marked.defaults.walkTokens;

          opts.walkTokens = function (token) {
            extension.walkTokens(token);

            if (walkTokens) {
              walkTokens(token);
            }
          };
        }

        marked.setOptions(opts);
      };
      /**
       * Run callback for every token
       */


      marked.walkTokens = function (tokens, callback) {
        for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
          var token = _step.value;
          callback(token);

          switch (token.type) {
            case 'table':
              {
                for (var _iterator2 = _createForOfIteratorHelperLoose(token.tokens.header), _step2; !(_step2 = _iterator2()).done;) {
                  var cell = _step2.value;
                  marked.walkTokens(cell, callback);
                }

                for (var _iterator3 = _createForOfIteratorHelperLoose(token.tokens.cells), _step3; !(_step3 = _iterator3()).done;) {
                  var row = _step3.value;

                  for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                    var _cell = _step4.value;
                    marked.walkTokens(_cell, callback);
                  }
                }

                break;
              }

            case 'list':
              {
                marked.walkTokens(token.items, callback);
                break;
              }

            default:
              {
                if (token.tokens) {
                  marked.walkTokens(token.tokens, callback);
                }
              }
          }
        }
      };
      /**
       * Parse Inline
       */


      marked.parseInline = function (src, opt) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked.parseInline(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);

        try {
          var tokens = Lexer_1.lexInline(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }

          return Parser_1.parseInline(tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      };
      /**
       * Expose
       */


      marked.Parser = Parser_1;
      marked.parser = Parser_1.parse;
      marked.Renderer = Renderer_1;
      marked.TextRenderer = TextRenderer_1;
      marked.Lexer = Lexer_1;
      marked.lexer = Lexer_1.lex;
      marked.Tokenizer = Tokenizer_1;
      marked.Slugger = Slugger_1;
      marked.parse = marked;
      var marked_1 = marked;

      return marked_1;

    })));
    });

    /* src/pages/Projects/ProjectDesc.svelte generated by Svelte v3.29.7 */

    const { console: console_1 } = globals;
    const file$k = "src/pages/Projects/ProjectDesc.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (26:3) {:else}
    function create_else_block(ctx) {
    	let t_value = /*project*/ ctx[0].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 1 && t_value !== (t_value = /*project*/ ctx[0].title + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(26:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:3) {#if project.titleComponent}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*project*/ ctx[0].titleComponent;

    	function switch_props(ctx) {
    		return {
    			props: { color: "text-gray-800" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*project*/ ctx[0].titleComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(24:3) {#if project.titleComponent}",
    		ctx
    	});

    	return block;
    }

    // (45:4) {#each project.icons as icon}
    function create_each_block(ctx) {
    	let span;
    	let switch_instance;
    	let t;
    	let current;
    	var switch_value = /*icon*/ ctx[5];

    	function switch_props(ctx) {
    		return {
    			props: { fillColor: "black" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(span, "class", "w-8 mx-1 inline-block");
    			add_location(span, file$k, 45, 5, 1465);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, span, null);
    			}

    			append_dev(span, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*icon*/ ctx[5])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, span, t);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:4) {#each project.icons as icon}",
    		ctx
    	});

    	return block;
    }

    // (55:3) {#if post}
    function create_if_block$1(ctx) {
    	let html_tag;
    	let raw_value = marked(/*post*/ ctx[3]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*post*/ 8 && raw_value !== (raw_value = marked(/*post*/ ctx[3]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(55:3) {#if post}",
    		ctx
    	});

    	return block;
    }

    // (21:0) <Modal open={modalOpen} onClose={onModalClose}>
    function create_default_slot(ctx) {
    	let div4;
    	let h2;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let div2;
    	let div0;
    	let a0;
    	let i0;
    	let t1;
    	let a0_href_value;
    	let t2;
    	let a1;
    	let i1;
    	let t3;
    	let a1_href_value;
    	let t4;
    	let div1;
    	let t5;
    	let hr;
    	let t6;
    	let div3;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*project*/ ctx[0].titleComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let each_value = /*project*/ ctx[0].icons;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block1 = /*post*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h2 = element("h2");
    			if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			t1 = text("Live site");
    			t2 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t3 = text("Source code");
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			div3 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(h2, "class", "text-4xl text-gray-800 w-48");
    			add_location(h2, file$k, 22, 2, 621);
    			attr_dev(i0, "class", "fas fa-link inline-block mr-2");
    			add_location(i0, file$k, 33, 20, 1071);
    			attr_dev(a0, "class", "py-1 px-4 rounded  m-1 inline-block shadow bg-navy-800 text-gray-100 hover:bg-navy-700");
    			attr_dev(a0, "href", a0_href_value = /*project*/ ctx[0].siteLink);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener");
    			add_location(a0, file$k, 29, 4, 898);
    			attr_dev(i1, "class", "fas fa-code inline-block mr-2");
    			add_location(i1, file$k, 40, 6, 1322);
    			attr_dev(a1, "class", "py-1 px-4 rounded  m-1 inline-block shadow bg-navy-800 text-gray-100 hover:bg-navy-700");
    			attr_dev(a1, "href", a1_href_value = /*project*/ ctx[0].sourceCodeLink);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener");
    			add_location(a1, file$k, 35, 4, 1137);
    			attr_dev(div0, "class", "flex-1");
    			add_location(div0, file$k, 28, 3, 873);
    			attr_dev(div1, "class", "flex-initial");
    			add_location(div1, file$k, 43, 3, 1399);
    			attr_dev(div2, "class", "flex justify-between items-end text-sm my-4");
    			add_location(div2, file$k, 27, 2, 812);
    			add_location(hr, file$k, 51, 2, 1605);
    			attr_dev(div3, "class", "project-post");
    			add_location(div3, file$k, 53, 2, 1615);
    			attr_dev(div4, "class", "bg-gray-50 text-gray-800 max-w-3xl p-3 md:p-6 lg:p-8");
    			add_location(div4, file$k, 21, 1, 552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h2);
    			if_blocks[current_block_type_index].m(h2, null);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, a0);
    			append_dev(a0, i0);
    			append_dev(a0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, a1);
    			append_dev(a1, i1);
    			append_dev(a1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div4, t5);
    			append_dev(div4, hr);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			if (if_block1) if_block1.m(div3, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(h2, null);
    			}

    			if (!current || dirty & /*project*/ 1 && a0_href_value !== (a0_href_value = /*project*/ ctx[0].siteLink)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*project*/ 1 && a1_href_value !== (a1_href_value = /*project*/ ctx[0].sourceCodeLink)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*project*/ 1) {
    				each_value = /*project*/ ctx[0].icons;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*post*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_blocks[current_block_type_index].d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(21:0) <Modal open={modalOpen} onClose={onModalClose}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				open: /*modalOpen*/ ctx[1],
    				onClose: /*onModalClose*/ ctx[2],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*modalOpen*/ 2) modal_changes.open = /*modalOpen*/ ctx[1];
    			if (dirty & /*onModalClose*/ 4) modal_changes.onClose = /*onModalClose*/ ctx[2];

    			if (dirty & /*$$scope, post, project*/ 265) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProjectDesc", slots, []);
    	let { project } = $$props;
    	let { modalOpen = false } = $$props;
    	let { onModalClose } = $$props;
    	let { post } = $$props;

    	const getHeadingList = node => {
    		const headingsLen = node.getElementsByTagName("h2").length;
    		let headings = [];

    		for (let i = 0; i < headingsLen; i++) {
    			console.log(node.getElementsByTagName("h2").item(i));
    			headings.push(node.getElementsByTagName("h2").item(i).id);
    		}

    		return headings;
    	};

    	const writable_props = ["project", "modalOpen", "onModalClose", "post"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<ProjectDesc> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    		if ("modalOpen" in $$props) $$invalidate(1, modalOpen = $$props.modalOpen);
    		if ("onModalClose" in $$props) $$invalidate(2, onModalClose = $$props.onModalClose);
    		if ("post" in $$props) $$invalidate(3, post = $$props.post);
    	};

    	$$self.$capture_state = () => ({
    		project,
    		modalOpen,
    		onModalClose,
    		post,
    		Modal,
    		marked,
    		getHeadingList
    	});

    	$$self.$inject_state = $$props => {
    		if ("project" in $$props) $$invalidate(0, project = $$props.project);
    		if ("modalOpen" in $$props) $$invalidate(1, modalOpen = $$props.modalOpen);
    		if ("onModalClose" in $$props) $$invalidate(2, onModalClose = $$props.onModalClose);
    		if ("post" in $$props) $$invalidate(3, post = $$props.post);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project, modalOpen, onModalClose, post];
    }

    class ProjectDesc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			project: 0,
    			modalOpen: 1,
    			onModalClose: 2,
    			post: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectDesc",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*project*/ ctx[0] === undefined && !("project" in props)) {
    			console_1.warn("<ProjectDesc> was created without expected prop 'project'");
    		}

    		if (/*onModalClose*/ ctx[2] === undefined && !("onModalClose" in props)) {
    			console_1.warn("<ProjectDesc> was created without expected prop 'onModalClose'");
    		}

    		if (/*post*/ ctx[3] === undefined && !("post" in props)) {
    			console_1.warn("<ProjectDesc> was created without expected prop 'post'");
    		}
    	}

    	get project() {
    		throw new Error("<ProjectDesc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<ProjectDesc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalOpen() {
    		throw new Error("<ProjectDesc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalOpen(value) {
    		throw new Error("<ProjectDesc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onModalClose() {
    		throw new Error("<ProjectDesc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onModalClose(value) {
    		throw new Error("<ProjectDesc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get post() {
    		throw new Error("<ProjectDesc>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set post(value) {
    		throw new Error("<ProjectDesc>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Projects/Project.svelte generated by Svelte v3.29.7 */
    const file$l = "src/pages/Projects/Project.svelte";

    // (50:2) {:else}
    function create_else_block$1(ctx) {
    	let h3;
    	let t_value = /*p*/ ctx[3].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t = text(t_value);
    			attr_dev(h3, "class", "font-bold text-2xl mb-2");
    			add_location(h3, file$l, 50, 3, 1360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*p*/ 8 && t_value !== (t_value = /*p*/ ctx[3].title + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(50:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:2) {#if p.titleComponent}
    function create_if_block$2(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	var switch_value = /*p*/ ctx[3].titleComponent;

    	function switch_props(ctx) {
    		return {
    			props: { color: "text-gray-50" },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", " w-32 lg:w-48 my-4");
    			add_location(div, file$l, 46, 3, 1234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*p*/ ctx[3].titleComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(46:2) {#if p.titleComponent}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let projectdesc;
    	let t0;
    	let div2;
    	let div0;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let img_alt_value;
    	let div0_class_value;
    	let t1;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let p_1;
    	let t3_value = /*p*/ ctx[3].bodyText + "";
    	let t3;
    	let t4;
    	let a0;
    	let i0;
    	let t5;
    	let a0_class_value;
    	let a0_href_value;
    	let t6;
    	let a1;
    	let i1;
    	let t7;
    	let a1_href_value;
    	let t8;
    	let a2;
    	let i2;
    	let t9;
    	let a2_href_value;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	projectdesc = new ProjectDesc({
    			props: {
    				project: /*p*/ ctx[3],
    				modalOpen: /*$location*/ ctx[4] === `/project/${/*name*/ ctx[0]}`,
    				onModalClose: /*func*/ ctx[5],
    				post: /*post*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*p*/ ctx[3].titleComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(projectdesc.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			if_block.c();
    			t2 = space();
    			p_1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			a0 = element("a");
    			i0 = element("i");
    			t5 = text("See more");
    			t6 = space();
    			a1 = element("a");
    			i1 = element("i");
    			t7 = text("Live site");
    			t8 = space();
    			a2 = element("a");
    			i2 = element("i");
    			t9 = text("Source code");
    			attr_dev(img, "class", img_class_value = /*post*/ ctx[2] ? "cursor-pointer" : "");
    			if (img.src !== (img_src_value = `./assets/project-images/${/*name*/ ctx[0]}_main.png`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "screenshot of " + /*p*/ ctx[3].title);
    			attr_dev(img, "width", "800");
    			attr_dev(img, "height", "500");
    			add_location(img, file$l, 32, 2, 853);
    			attr_dev(div0, "class", div0_class_value = "" + ("flex-initial w-full md:w-5/12 order-1 m-2 md:m-4 " + (/*imageFirst*/ ctx[1] ? "md:order-1" : "md:order-2") + " "));
    			add_location(div0, file$l, 28, 1, 730);
    			attr_dev(p_1, "class", "leading-tight");
    			add_location(p_1, file$l, 52, 2, 1421);
    			attr_dev(i0, "class", "fas fa-plus-circle inline-block mr-2");
    			add_location(i0, file$l, 58, 4, 1603);

    			attr_dev(a0, "class", a0_class_value = /*post*/ ctx[2]
    			? "border-b-4 border-gray-400 mx-1 mt-3 inline-block px-3 pb-0.5"
    			: "hidden");

    			attr_dev(a0, "href", a0_href_value = `#/project/${/*name*/ ctx[0]}`);
    			add_location(a0, file$l, 53, 2, 1465);
    			attr_dev(i1, "class", "fas fa-link inline-block mr-2");
    			add_location(i1, file$l, 64, 18, 1806);
    			attr_dev(a1, "class", "border-b-2 border-gray-400 mx-1 mt-3 inline-block px-2 text-sm");
    			attr_dev(a1, "href", a1_href_value = /*p*/ ctx[3].siteLink);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener");
    			add_location(a1, file$l, 60, 2, 1671);
    			attr_dev(i2, "class", "fas fa-code inline-block mr-2");
    			add_location(i2, file$l, 70, 18, 2009);
    			attr_dev(a2, "class", "border-b-2 border-gray-400 mx-1 mt-3 inline-block px-2 text-sm");
    			attr_dev(a2, "href", a2_href_value = /*p*/ ctx[3].sourceCodeLink);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "rel", "noopener");
    			add_location(a2, file$l, 66, 2, 1868);
    			attr_dev(div1, "class", div1_class_value = " " + ("flex-1 w-full md:w-7/12 order-2 m-2 md:m-4 " + (/*imageFirst*/ ctx[1] ? "md:order-2" : "md:order-1")));
    			add_location(div1, file$l, 41, 1, 1091);
    			attr_dev(div2, "class", "flex flex-wrap py-8 md:py-12 lg:py-20 items-center");
    			add_location(div2, file$l, 27, 0, 664);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectdesc, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, p_1);
    			append_dev(p_1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, a0);
    			append_dev(a0, i0);
    			append_dev(a0, t5);
    			append_dev(div1, t6);
    			append_dev(div1, a1);
    			append_dev(a1, i1);
    			append_dev(a1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, a2);
    			append_dev(a2, i2);
    			append_dev(a2, t9);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					img,
    					"click",
    					function () {
    						if (is_function(/*post*/ ctx[2]
    						? /*click_handler*/ ctx[6]
    						: click_handler_1)) (/*post*/ ctx[2]
    						? /*click_handler*/ ctx[6]
    						: click_handler_1).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const projectdesc_changes = {};
    			if (dirty & /*p*/ 8) projectdesc_changes.project = /*p*/ ctx[3];
    			if (dirty & /*$location, name*/ 17) projectdesc_changes.modalOpen = /*$location*/ ctx[4] === `/project/${/*name*/ ctx[0]}`;
    			if (dirty & /*post*/ 4) projectdesc_changes.post = /*post*/ ctx[2];
    			projectdesc.$set(projectdesc_changes);

    			if (!current || dirty & /*post*/ 4 && img_class_value !== (img_class_value = /*post*/ ctx[2] ? "cursor-pointer" : "")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (!current || dirty & /*name*/ 1 && img.src !== (img_src_value = `./assets/project-images/${/*name*/ ctx[0]}_main.png`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*p*/ 8 && img_alt_value !== (img_alt_value = "screenshot of " + /*p*/ ctx[3].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (!current || dirty & /*imageFirst*/ 2 && div0_class_value !== (div0_class_value = "" + ("flex-initial w-full md:w-5/12 order-1 m-2 md:m-4 " + (/*imageFirst*/ ctx[1] ? "md:order-1" : "md:order-2") + " "))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, t2);
    			}

    			if ((!current || dirty & /*p*/ 8) && t3_value !== (t3_value = /*p*/ ctx[3].bodyText + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*post*/ 4 && a0_class_value !== (a0_class_value = /*post*/ ctx[2]
    			? "border-b-4 border-gray-400 mx-1 mt-3 inline-block px-3 pb-0.5"
    			: "hidden")) {
    				attr_dev(a0, "class", a0_class_value);
    			}

    			if (!current || dirty & /*name*/ 1 && a0_href_value !== (a0_href_value = `#/project/${/*name*/ ctx[0]}`)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (!current || dirty & /*p*/ 8 && a1_href_value !== (a1_href_value = /*p*/ ctx[3].siteLink)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (!current || dirty & /*p*/ 8 && a2_href_value !== (a2_href_value = /*p*/ ctx[3].sourceCodeLink)) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (!current || dirty & /*imageFirst*/ 2 && div1_class_value !== (div1_class_value = " " + ("flex-1 w-full md:w-7/12 order-2 m-2 md:m-4 " + (/*imageFirst*/ ctx[1] ? "md:order-2" : "md:order-1")))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectdesc.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectdesc.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectdesc, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler_1 = () => {
    	
    };

    function instance$l($$self, $$props, $$invalidate) {
    	let $location;
    	validate_store(location, "location");
    	component_subscribe($$self, location, $$value => $$invalidate(4, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project", slots, []);
    	let { name } = $$props;
    	let { imageFirst = true } = $$props;
    	let post;

    	fetch(`./assets/project-descriptions/${name}.md`, { mode: "no-cors" }).then(r => r.status < 299 && r.status >= 200
    	? r.text()
    	: new Promise(resolve => resolve(undefined))).then(r => $$invalidate(2, post = r));

    	const writable_props = ["name", "imageFirst"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	const func = () => push("/");
    	const click_handler = () => push(`/project/${name}`);

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("imageFirst" in $$props) $$invalidate(1, imageFirst = $$props.imageFirst);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		imageFirst,
    		location,
    		push,
    		projects,
    		Modal,
    		ProjectDesc,
    		post,
    		p,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("imageFirst" in $$props) $$invalidate(1, imageFirst = $$props.imageFirst);
    		if ("post" in $$props) $$invalidate(2, post = $$props.post);
    		if ("p" in $$props) $$invalidate(3, p = $$props.p);
    	};

    	let p;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*name*/ 1) {
    			 $$invalidate(3, p = { ...projects[name], name });
    		}
    	};

    	return [name, imageFirst, post, p, $location, func, click_handler];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { name: 0, imageFirst: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Project> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageFirst() {
    		throw new Error("<Project>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageFirst(value) {
    		throw new Error("<Project>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Projects/Projects.svelte generated by Svelte v3.29.7 */
    const file$m = "src/pages/Projects/Projects.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (13:3) {#each projects as project, i}
    function create_each_block$1(ctx) {
    	let project;
    	let current;

    	project = new Project({
    			props: {
    				name: /*project*/ ctx[1],
    				imageFirst: /*i*/ ctx[3] % 2 === 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(project.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(project, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const project_changes = {};
    			if (dirty & /*projects*/ 1) project_changes.name = /*project*/ ctx[1];
    			project.$set(project_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(project.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(project.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(project, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(13:3) {#each projects as project, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let section;
    	let divider1;
    	let t0;
    	let div2;
    	let h2;
    	let t2;
    	let div0;
    	let t3;
    	let div1;
    	let a;
    	let i0;
    	let t4;
    	let i1;
    	let current;

    	divider1 = new Divider1({
    			props: { color: "text-gray-100" },
    			$$inline: true
    		});

    	let each_value = /*projects*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(divider1.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Projects";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div1 = element("div");
    			a = element("a");
    			i0 = element("i");
    			t4 = text("\n\t\t\t\tSee more on Github\n\t\t\t\t");
    			i1 = element("i");
    			attr_dev(h2, "class", "section-header");
    			add_location(h2, file$m, 10, 2, 290);
    			attr_dev(div0, "class", "divide-y divide-gray-600");
    			add_location(div0, file$m, 11, 2, 333);
    			attr_dev(i0, "class", "fab fa-github mr-2");
    			add_location(i0, file$m, 23, 4, 781);
    			attr_dev(i1, "class", "fas fa-arrow-right ml-1 group-hover:ml-2 transition-spacing duration-300");
    			add_location(i1, file$m, 25, 4, 841);
    			attr_dev(a, "class", "group text-lg font-bold p flex-inital hover:pr-4 transition-spacing duration-300 mt-3 inline-block px-5 py-1.5 rounded-lg shadow-lg bg-gray-200 text-gray-900");
    			attr_dev(a, "href", "http://github.com/lauraschultz");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener");
    			add_location(a, file$m, 17, 3, 518);
    			attr_dev(div1, "class", "flex justify-end");
    			add_location(div1, file$m, 16, 2, 484);
    			attr_dev(div2, "class", "section-container ");
    			add_location(div2, file$m, 9, 1, 255);
    			attr_dev(section, "class", "section bg-gray-800 text-gray-100 pt-0");
    			attr_dev(section, "id", "projects");
    			add_location(section, file$m, 6, 0, 146);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(divider1, section, null);
    			append_dev(section, t0);
    			append_dev(section, div2);
    			append_dev(div2, h2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, i0);
    			append_dev(a, t4);
    			append_dev(a, i1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*projects*/ 1) {
    				each_value = /*projects*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(divider1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(divider1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(divider1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Projects", slots, []);
    	let { projects } = $$props;
    	const writable_props = ["projects"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	$$self.$capture_state = () => ({ Divider1, Project, projects });

    	$$self.$inject_state = $$props => {
    		if ("projects" in $$props) $$invalidate(0, projects = $$props.projects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [projects];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { projects: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*projects*/ ctx[0] === undefined && !("projects" in props)) {
    			console.warn("<Projects> was created without expected prop 'projects'");
    		}
    	}

    	get projects() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/dividers/Divider2.svelte generated by Svelte v3.29.7 */

    const file$n = "src/shared/dividers/Divider2.svelte";

    function create_fragment$n(ctx) {
    	let svg;
    	let path;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M456 0H0.5C0.5 0 54.8993 16.5 93.5 16.5C139 16.5 177.345 4 226 4C275 4 296 11 355 11C397.325 11 456 0 456 0Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$n, 13, 1, 229);
    			attr_dev(svg, "class", svg_class_value = "w-screen max-h-24 h-8 md:h-auto " + /*color*/ ctx[0]);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "viewBox", "0 0.5 456 17");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$n, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1 && svg_class_value !== (svg_class_value = "w-screen max-h-24 h-8 md:h-auto " + /*color*/ ctx[0])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider2", slots, []);
    	let { color } = $$props;
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider2> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color];
    }

    class Divider2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider2",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[0] === undefined && !("color" in props)) {
    			console.warn("<Divider2> was created without expected prop 'color'");
    		}
    	}

    	get color() {
    		throw new Error("<Divider2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Divider2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Skills/Skills.svelte generated by Svelte v3.29.7 */

    const { Object: Object_1 } = globals;
    const file$o = "src/pages/Skills/Skills.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i][0];
    	child_ctx[5] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i][0];
    	child_ctx[9] = list[i][1];
    	return child_ctx;
    }

    // (19:3) {#each Object.entries(groupContent) as [name, component]}
    function create_each_block_1(ctx) {
    	let button;
    	let span1;
    	let switch_instance;
    	let t0;
    	let span0;
    	let t1_value = /*name*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let button_alt_value;
    	let button_title_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*component*/ ctx[9];

    	function switch_props(ctx) {
    		return {
    			props: {
    				fillColor: "#57534E",
    				backgroundColor: "#F5F5F4"
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*name*/ ctx[8]);
    	}

    	function hover_handler() {
    		return /*hover_handler*/ ctx[3](/*name*/ ctx[8]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			span1 = element("span");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(span0, "class", "tooltiptext invisible bg-gray-900 text-gray-50 rounded py-1 px-4 absolute group-hover:visible mt-2 transform -translate-x-1/2 z-20 whitespace-nowrap svelte-2dpcgm");
    			add_location(span0, file$o, 32, 6, 981);
    			attr_dev(span1, "class", "group");
    			add_location(span1, file$o, 26, 5, 837);
    			attr_dev(button, "class", "inline-block m-1 sm:m-2 w-12 sm:w-16 relative focus:outline-none focus-visible:shadow-outline");
    			attr_dev(button, "alt", button_alt_value = /*name*/ ctx[8]);
    			attr_dev(button, "title", button_title_value = /*name*/ ctx[8]);
    			add_location(button, file$o, 19, 4, 595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span1);

    			if (switch_instance) {
    				mount_component(switch_instance, span1, null);
    			}

    			append_dev(span1, t0);
    			append_dev(span1, span0);
    			append_dev(span0, t1);
    			append_dev(button, t2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler, false, false, false),
    					listen_dev(button, "hover", hover_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (switch_value !== (switch_value = /*component*/ ctx[9])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, span1, t0);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(19:3) {#each Object.entries(groupContent) as [name, component]}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {#each Object.entries(skills) as [groupName, groupContent]}
    function create_each_block$2(ctx) {
    	let div;
    	let t0_value = /*groupName*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let current;
    	let each_value_1 = Object.entries(/*groupContent*/ ctx[5]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "uppercase font-bold tracking-wide my-4 text-lg border-b border-gray-400");
    			add_location(div, file$o, 13, 3, 410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, skills, labelName*/ 2) {
    				each_value_1 = Object.entries(/*groupContent*/ ctx[5]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(13:2) {#each Object.entries(skills) as [groupName, groupContent]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let section;
    	let divider2;
    	let t0;
    	let div;
    	let h2;
    	let t2;
    	let p;
    	let t3;
    	let t4;
    	let current;

    	divider2 = new Divider2({
    			props: { color: "text-gray-800" },
    			$$inline: true
    		});

    	let each_value = Object.entries(skills);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(divider2.$$.fragment);
    			t0 = space();
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Skills";
    			t2 = space();
    			p = element("p");
    			t3 = text(/*skillsIntro*/ ctx[0]);
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "section-header");
    			add_location(h2, file$o, 10, 2, 283);
    			add_location(p, file$o, 11, 2, 324);
    			attr_dev(div, "class", "section-container");
    			add_location(div, file$o, 9, 1, 249);
    			attr_dev(section, "class", "section ");
    			attr_dev(section, "id", "skills");
    			add_location(section, file$o, 7, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(divider2, section, null);
    			append_dev(section, t0);
    			append_dev(section, div);
    			append_dev(div, h2);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			append_dev(div, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*skillsIntro*/ 1) set_data_dev(t3, /*skillsIntro*/ ctx[0]);

    			if (dirty & /*Object, skills, labelName*/ 2) {
    				each_value = Object.entries(skills);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(divider2.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(divider2.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(divider2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Skills", slots, []);
    	let { skillsIntro } = $$props;
    	let labelName = "";
    	const writable_props = ["skillsIntro"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	const click_handler = name => $$invalidate(1, labelName = name);
    	const hover_handler = name => $$invalidate(1, labelName = name);

    	$$self.$$set = $$props => {
    		if ("skillsIntro" in $$props) $$invalidate(0, skillsIntro = $$props.skillsIntro);
    	};

    	$$self.$capture_state = () => ({ skillsIntro, skills, Divider2, labelName });

    	$$self.$inject_state = $$props => {
    		if ("skillsIntro" in $$props) $$invalidate(0, skillsIntro = $$props.skillsIntro);
    		if ("labelName" in $$props) $$invalidate(1, labelName = $$props.labelName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [skillsIntro, labelName, click_handler, hover_handler];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { skillsIntro: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*skillsIntro*/ ctx[0] === undefined && !("skillsIntro" in props)) {
    			console.warn("<Skills> was created without expected prop 'skillsIntro'");
    		}
    	}

    	get skillsIntro() {
    		throw new Error("<Skills>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skillsIntro(value) {
    		throw new Error("<Skills>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/shared/dividers/Divider3.svelte generated by Svelte v3.29.7 */

    const file$p = "src/shared/dividers/Divider3.svelte";

    function create_fragment$p(ctx) {
    	let svg;
    	let path;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M421.5 0.5H0.5C0.5 0.5 60.0272 35.5 103 35.5C162.5 35.5 184.5 6.5 273.5 6.5C331.797 6.5 421.5 26 421.5 26V0.5Z");
    			attr_dev(path, "fill", "currentColor");
    			add_location(path, file$p, 13, 1, 229);
    			attr_dev(svg, "class", svg_class_value = "w-screen max-h-24 h-8 md:h-auto " + /*color*/ ctx[0]);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "viewBox", "0 0.5 422 36");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$p, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1 && svg_class_value !== (svg_class_value = "w-screen max-h-24 h-8 md:h-auto " + /*color*/ ctx[0])) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider3", slots, []);
    	let { color } = $$props;
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider3> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color];
    }

    class Divider3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider3",
    			options,
    			id: create_fragment$p.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[0] === undefined && !("color" in props)) {
    			console.warn("<Divider3> was created without expected prop 'color'");
    		}
    	}

    	get color() {
    		throw new Error("<Divider3>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Divider3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/Contact/Contact.svelte generated by Svelte v3.29.7 */
    const file$q = "src/pages/Contact/Contact.svelte";

    function create_fragment$q(ctx) {
    	let section;
    	let divider3;
    	let t0;
    	let div5;
    	let h2;
    	let t2;
    	let div4;
    	let a0;
    	let span0;
    	let div0;
    	let i0;
    	let span2;
    	let span1;
    	let t4;
    	let a1;
    	let span3;
    	let div1;
    	let i1;
    	let span5;
    	let span4;
    	let t6;
    	let p;
    	let t8;
    	let form;
    	let div2;
    	let i2;
    	let t9;
    	let input0;
    	let t10;
    	let input1;
    	let t11;
    	let hr;
    	let t12;
    	let textarea;
    	let t13;
    	let div3;
    	let i3;
    	let t14;
    	let input2;
    	let t15;
    	let button;
    	let t16;
    	let i4;
    	let current;

    	divider3 = new Divider3({
    			props: { color: "text-gray-100" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(divider3.$$.fragment);
    			t0 = space();
    			div5 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Contact";
    			t2 = space();
    			div4 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			div0 = element("div");
    			i0 = element("i");
    			span2 = element("span");
    			span1 = element("span");
    			span1.textContent = "lauraschultz";
    			t4 = space();
    			a1 = element("a");
    			span3 = element("span");
    			div1 = element("div");
    			i1 = element("i");
    			span5 = element("span");
    			span4 = element("span");
    			span4.textContent = "schultzlaurac@gmail.com";
    			t6 = space();
    			p = element("p");
    			p.textContent = "Or, send me a message using the form below and I will respond to you\n\t\t\t\tsoon:";
    			t8 = space();
    			form = element("form");
    			div2 = element("div");
    			i2 = element("i");
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			textarea = element("textarea");
    			t13 = space();
    			div3 = element("div");
    			i3 = element("i");
    			t14 = space();
    			input2 = element("input");
    			t15 = space();
    			button = element("button");
    			t16 = text("Submit\n\t\t\t\t\t");
    			i4 = element("i");
    			attr_dev(h2, "class", "section-header");
    			add_location(h2, file$q, 7, 2, 218);
    			attr_dev(i0, "class", "fab fa-linkedin");
    			add_location(i0, file$q, 16, 11, 580);
    			add_location(div0, file$q, 16, 6, 575);
    			attr_dev(span0, "class", "flex-initial flex items-center w-12 h-12 -mr-4 bg-blue-500 rounded-full justify-center text-xl shadow z-20");
    			add_location(span0, file$q, 14, 5, 443);
    			attr_dev(span1, "class", "ml-6 mr-2");
    			add_location(span1, file$q, 18, 6, 692);
    			attr_dev(span2, "class", "flex-initial border-b-4 border-gray-300 z-10");
    			add_location(span2, file$q, 17, 5, 627);
    			attr_dev(a0, "href", "https://www.linkedin.com/in/lauraschultz/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noopener");
    			attr_dev(a0, "class", "flex justify-start items-center my-8");
    			add_location(a0, file$q, 9, 3, 294);
    			attr_dev(i1, "class", "fas fa-envelope");
    			add_location(i1, file$q, 28, 11, 1034);
    			add_location(div1, file$q, 28, 6, 1029);
    			attr_dev(span3, "class", "flex-initial flex items-center w-12 h-12 -mr-4 bg-blue-500 rounded-full justify-center text-xl shadow z-20");
    			add_location(span3, file$q, 26, 5, 897);
    			attr_dev(span4, "class", "ml-6 mr-2");
    			add_location(span4, file$q, 30, 6, 1157);
    			attr_dev(span5, "class", "flex-initial select-all border-b-4 border-gray-300 z-10");
    			add_location(span5, file$q, 29, 5, 1081);
    			attr_dev(a1, "href", "mailto:schultzlaurac@gmail.com");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noopener");
    			attr_dev(a1, "class", "flex justify-start items-center my-8");
    			add_location(a1, file$q, 21, 3, 759);
    			attr_dev(p, "class", "pt-3 italic text-sm leading-tight");
    			add_location(p, file$q, 34, 3, 1236);
    			attr_dev(i2, "class", "fas fa-pencil-alt absolute top-0 left-0 -ml-10 my-4 text-gray-100");
    			attr_dev(i2, "data-fa-transform", "grow-8 flip-h");
    			add_location(i2, file$q, 42, 5, 1566);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "form-name");
    			input0.value = "contact";
    			add_location(input0, file$q, 46, 5, 1702);
    			attr_dev(input1, "name", "subject");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "my-2 focus:outline-none block w-full bg-gray-100 font-bold");
    			attr_dev(input1, "placeholder", "Subject");
    			attr_dev(input1, "aria-label", "Subject");
    			add_location(input1, file$q, 47, 5, 1764);
    			add_location(hr, file$q, 54, 5, 1951);
    			attr_dev(textarea, "name", "message");
    			attr_dev(textarea, "class", "my-2 focus:outline-none block w-full bg-gray-100");
    			attr_dev(textarea, "rows", "6");
    			attr_dev(textarea, "placeholder", "Message");
    			attr_dev(textarea, "aria-label", "Message");
    			add_location(textarea, file$q, 55, 5, 1963);
    			attr_dev(div2, "class", "px-4 py-2 rounded shadow bg-gray-100 text-gray-600 focus-within:ring focus-within:border-gray-300 my-4 relative");
    			add_location(div2, file$q, 39, 4, 1425);
    			attr_dev(i3, "class", "fas fa-at absolute top-0 left-0 -ml-10 my-5 text-gray-100");
    			attr_dev(i3, "data-fa-transform", "grow-8");
    			add_location(i3, file$q, 65, 5, 2184);
    			attr_dev(input2, "name", "email");
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "class", "p-4 rounded shadow bg-gray-100 text-gray-600 block w-full focus:outline-none focus:ring focus:border-gray-300");
    			attr_dev(input2, "placeholder", "Email");
    			attr_dev(input2, "aria-label", "Email");
    			add_location(input2, file$q, 70, 5, 2306);
    			attr_dev(div3, "class", "relative my-4");
    			add_location(div3, file$q, 64, 4, 2151);
    			attr_dev(i4, "class", "fas fa-paper-plane ml-1 group-hover:ml-2 group-hover:pb-1 transition-spacing duration-300");
    			add_location(i4, file$q, 86, 5, 2834);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "group text-lg font-bold flex-inital hover:pr-4 transition-spacing duration-300 bg-blue-500 text-gray-100 px-5 py-1.5 rounded-lg shadow-lg");
    			attr_dev(button, "href", "http://github.com/lauraschultz");
    			attr_dev(button, "target", "_blank");
    			attr_dev(button, "rel", "noopener");
    			add_location(button, file$q, 78, 4, 2549);
    			attr_dev(form, "name", "contact");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "");
    			add_location(form, file$q, 38, 3, 1376);
    			attr_dev(div4, "class", "max-w-md mx-auto");
    			add_location(div4, file$q, 8, 2, 260);
    			attr_dev(div5, "class", "section-container");
    			add_location(div5, file$q, 6, 1, 184);
    			attr_dev(section, "class", "section bg-blue-900 text-gray-50");
    			attr_dev(section, "id", "contact");
    			add_location(section, file$q, 4, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(divider3, section, null);
    			append_dev(section, t0);
    			append_dev(section, div5);
    			append_dev(div5, h2);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, a0);
    			append_dev(a0, span0);
    			append_dev(span0, div0);
    			append_dev(div0, i0);
    			append_dev(a0, span2);
    			append_dev(span2, span1);
    			append_dev(div4, t4);
    			append_dev(div4, a1);
    			append_dev(a1, span3);
    			append_dev(span3, div1);
    			append_dev(div1, i1);
    			append_dev(a1, span5);
    			append_dev(span5, span4);
    			append_dev(div4, t6);
    			append_dev(div4, p);
    			append_dev(div4, t8);
    			append_dev(div4, form);
    			append_dev(form, div2);
    			append_dev(div2, i2);
    			append_dev(div2, t9);
    			append_dev(div2, input0);
    			append_dev(div2, t10);
    			append_dev(div2, input1);
    			append_dev(div2, t11);
    			append_dev(div2, hr);
    			append_dev(div2, t12);
    			append_dev(div2, textarea);
    			append_dev(form, t13);
    			append_dev(form, div3);
    			append_dev(div3, i3);
    			append_dev(div3, t14);
    			append_dev(div3, input2);
    			append_dev(form, t15);
    			append_dev(form, button);
    			append_dev(button, t16);
    			append_dev(button, i4);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(divider3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(divider3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(divider3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Contact", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Divider3 });
    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/pages/Footer/Footer.svelte generated by Svelte v3.29.7 */

    const file$r = "src/pages/Footer/Footer.svelte";

    function create_fragment$r(ctx) {
    	let footer;
    	let span0;
    	let t1;
    	let span1;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			span0 = element("span");
    			span0.textContent = "Laura Schultz 2021";
    			t1 = space();
    			span1 = element("span");
    			a = element("a");
    			a.textContent = "Source code";
    			attr_dev(span0, "class", "p-2 inline-block");
    			add_location(span0, file$r, 3, 1, 150);
    			attr_dev(a, "class", " border-b border-gray-400");
    			attr_dev(a, "href", "https://github.com/lauraschultz/personal-site");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener");
    			add_location(a, file$r, 5, 2, 242);
    			attr_dev(span1, "class", "p-2 inline-block");
    			add_location(span1, file$r, 4, 1, 208);
    			attr_dev(footer, "class", "bg-gray-800 text-gray-50 p-4 text-xs lg:px-6 shadow-inner divide-x divide-gray-600 text-right overflow-x-scroll whitespace-nowrap");
    			add_location(footer, file$r, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, span0);
    			append_dev(footer, t1);
    			append_dev(footer, span1);
    			append_dev(span1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    var content = {
    	"default": {
    	projects: [
    		"chew",
    		"bikeshare",
    		"halloween",
    		"trivia"
    	],
    	bio: "I'm a recent college graduate and software developer based in Berlin, Germany. I love learning about all things web development and creating sites that walk the line between beautiful design and a fast, intuitive experience for the user. If you're interested in working together, please get in touch with me.",
    	skillsIntro: "These are the languages, tools, and frameworks that I've been working with recently.",
    	resume: [
    		"quandoo",
    		"surescripts",
    		"tutoring",
    		"marquette"
    	]
    },
    	"/1": {
    	projects: [
    		"chew"
    	]
    }
    };

    /*!
     * Font Awesome Free 5.15.1 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     */
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);

        if (typeof Object.getOwnPropertySymbols === 'function') {
          ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
            return Object.getOwnPropertyDescriptor(source, sym).enumerable;
          }));
        }

        ownKeys.forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      }

      return target;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

        return arr2;
      }
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArray(iter) {
      if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
    }

    function _iterableToArrayLimit(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance");
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }

    var noop$1 = function noop() {};

    var _WINDOW = {};
    var _DOCUMENT = {};
    var _MUTATION_OBSERVER = null;
    var _PERFORMANCE = {
      mark: noop$1,
      measure: noop$1
    };

    try {
      if (typeof window !== 'undefined') _WINDOW = window;
      if (typeof document !== 'undefined') _DOCUMENT = document;
      if (typeof MutationObserver !== 'undefined') _MUTATION_OBSERVER = MutationObserver;
      if (typeof performance !== 'undefined') _PERFORMANCE = performance;
    } catch (e) {}

    var _ref = _WINDOW.navigator || {},
        _ref$userAgent = _ref.userAgent,
        userAgent = _ref$userAgent === void 0 ? '' : _ref$userAgent;

    var WINDOW = _WINDOW;
    var DOCUMENT = _DOCUMENT;
    var MUTATION_OBSERVER = _MUTATION_OBSERVER;
    var PERFORMANCE = _PERFORMANCE;
    var IS_BROWSER = !!WINDOW.document;
    var IS_DOM = !!DOCUMENT.documentElement && !!DOCUMENT.head && typeof DOCUMENT.addEventListener === 'function' && typeof DOCUMENT.createElement === 'function';
    var IS_IE = ~userAgent.indexOf('MSIE') || ~userAgent.indexOf('Trident/');

    var NAMESPACE_IDENTIFIER = '___FONT_AWESOME___';
    var UNITS_IN_GRID = 16;
    var DEFAULT_FAMILY_PREFIX = 'fa';
    var DEFAULT_REPLACEMENT_CLASS = 'svg-inline--fa';
    var DATA_FA_I2SVG = 'data-fa-i2svg';
    var DATA_FA_PSEUDO_ELEMENT = 'data-fa-pseudo-element';
    var DATA_FA_PSEUDO_ELEMENT_PENDING = 'data-fa-pseudo-element-pending';
    var DATA_PREFIX = 'data-prefix';
    var DATA_ICON = 'data-icon';
    var HTML_CLASS_I2SVG_BASE_CLASS = 'fontawesome-i2svg';
    var MUTATION_APPROACH_ASYNC = 'async';
    var TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS = ['HTML', 'HEAD', 'STYLE', 'SCRIPT'];
    var PRODUCTION = function () {
      try {
        return process.env.NODE_ENV === 'production';
      } catch (e) {
        return false;
      }
    }();
    var PREFIX_TO_STYLE = {
      'fas': 'solid',
      'far': 'regular',
      'fal': 'light',
      'fad': 'duotone',
      'fab': 'brands',
      'fak': 'kit',
      'fa': 'solid'
    };
    var STYLE_TO_PREFIX = {
      'solid': 'fas',
      'regular': 'far',
      'light': 'fal',
      'duotone': 'fad',
      'brands': 'fab',
      'kit': 'fak'
    };
    var LAYERS_TEXT_CLASSNAME = 'fa-layers-text';
    var FONT_FAMILY_PATTERN = /Font Awesome ([5 ]*)(Solid|Regular|Light|Duotone|Brands|Free|Pro|Kit).*/; // TODO: do we need to handle font-weight for kit SVG pseudo-elements?

    var FONT_WEIGHT_TO_PREFIX = {
      '900': 'fas',
      '400': 'far',
      'normal': 'far',
      '300': 'fal'
    };
    var oneToTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var oneToTwenty = oneToTen.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    var ATTRIBUTES_WATCHED_FOR_MUTATION = ['class', 'data-prefix', 'data-icon', 'data-fa-transform', 'data-fa-mask'];
    var DUOTONE_CLASSES = {
      GROUP: 'group',
      SWAP_OPACITY: 'swap-opacity',
      PRIMARY: 'primary',
      SECONDARY: 'secondary'
    };
    var RESERVED_CLASSES = ['xs', 'sm', 'lg', 'fw', 'ul', 'li', 'border', 'pull-left', 'pull-right', 'spin', 'pulse', 'rotate-90', 'rotate-180', 'rotate-270', 'flip-horizontal', 'flip-vertical', 'flip-both', 'stack', 'stack-1x', 'stack-2x', 'inverse', 'layers', 'layers-text', 'layers-counter', DUOTONE_CLASSES.GROUP, DUOTONE_CLASSES.SWAP_OPACITY, DUOTONE_CLASSES.PRIMARY, DUOTONE_CLASSES.SECONDARY].concat(oneToTen.map(function (n) {
      return "".concat(n, "x");
    })).concat(oneToTwenty.map(function (n) {
      return "w-".concat(n);
    }));

    var initial = WINDOW.FontAwesomeConfig || {};

    function getAttrConfig(attr) {
      var element = DOCUMENT.querySelector('script[' + attr + ']');

      if (element) {
        return element.getAttribute(attr);
      }
    }

    function coerce(val) {
      // Getting an empty string will occur if the attribute is set on the HTML tag but without a value
      // We'll assume that this is an indication that it should be toggled to true
      // For example <script data-search-pseudo-elements src="..."></script>
      if (val === '') return true;
      if (val === 'false') return false;
      if (val === 'true') return true;
      return val;
    }

    if (DOCUMENT && typeof DOCUMENT.querySelector === 'function') {
      var attrs = [['data-family-prefix', 'familyPrefix'], ['data-replacement-class', 'replacementClass'], ['data-auto-replace-svg', 'autoReplaceSvg'], ['data-auto-add-css', 'autoAddCss'], ['data-auto-a11y', 'autoA11y'], ['data-search-pseudo-elements', 'searchPseudoElements'], ['data-observe-mutations', 'observeMutations'], ['data-mutate-approach', 'mutateApproach'], ['data-keep-original-source', 'keepOriginalSource'], ['data-measure-performance', 'measurePerformance'], ['data-show-missing-icons', 'showMissingIcons']];
      attrs.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            attr = _ref2[0],
            key = _ref2[1];

        var val = coerce(getAttrConfig(attr));

        if (val !== undefined && val !== null) {
          initial[key] = val;
        }
      });
    }

    var _default = {
      familyPrefix: DEFAULT_FAMILY_PREFIX,
      replacementClass: DEFAULT_REPLACEMENT_CLASS,
      autoReplaceSvg: true,
      autoAddCss: true,
      autoA11y: true,
      searchPseudoElements: false,
      observeMutations: true,
      mutateApproach: 'async',
      keepOriginalSource: true,
      measurePerformance: false,
      showMissingIcons: true
    };

    var _config = _objectSpread({}, _default, initial);

    if (!_config.autoReplaceSvg) _config.observeMutations = false;

    var config = _objectSpread({}, _config);

    WINDOW.FontAwesomeConfig = config;

    var w = WINDOW || {};
    if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
    if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
    if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
    if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
    var namespace = w[NAMESPACE_IDENTIFIER];

    var functions = [];

    var listener = function listener() {
      DOCUMENT.removeEventListener('DOMContentLoaded', listener);
      loaded = 1;
      functions.map(function (fn) {
        return fn();
      });
    };

    var loaded = false;

    if (IS_DOM) {
      loaded = (DOCUMENT.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(DOCUMENT.readyState);
      if (!loaded) DOCUMENT.addEventListener('DOMContentLoaded', listener);
    }

    function domready (fn) {
      if (!IS_DOM) return;
      loaded ? setTimeout(fn, 0) : functions.push(fn);
    }

    var PENDING = 'pending';
    var SETTLED = 'settled';
    var FULFILLED = 'fulfilled';
    var REJECTED = 'rejected';

    var NOOP = function NOOP() {};

    var isNode = typeof global !== 'undefined' && typeof global.process !== 'undefined' && typeof global.process.emit === 'function';
    var asyncSetTimer = typeof setImmediate === 'undefined' ? setTimeout : setImmediate;
    var asyncQueue = [];
    var asyncTimer;

    function asyncFlush() {
      // run promise callbacks
      for (var i = 0; i < asyncQueue.length; i++) {
        asyncQueue[i][0](asyncQueue[i][1]);
      } // reset async asyncQueue


      asyncQueue = [];
      asyncTimer = false;
    }

    function asyncCall(callback, arg) {
      asyncQueue.push([callback, arg]);

      if (!asyncTimer) {
        asyncTimer = true;
        asyncSetTimer(asyncFlush, 0);
      }
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch (e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(subscriber) {
      var owner = subscriber.owner;
      var settled = owner._state;
      var value = owner._data;
      var callback = subscriber[settled];
      var promise = subscriber.then;

      if (typeof callback === 'function') {
        settled = FULFILLED;

        try {
          value = callback(value);
        } catch (e) {
          reject(promise, e);
        }
      }

      if (!handleThenable(promise, value)) {
        if (settled === FULFILLED) {
          resolve(promise, value);
        }

        if (settled === REJECTED) {
          reject(promise, value);
        }
      }
    }

    function handleThenable(promise, value) {
      var resolved;

      try {
        if (promise === value) {
          throw new TypeError('A promises callback cannot return that same promise.');
        }

        if (value && (typeof value === 'function' || _typeof(value) === 'object')) {
          // then should be retrieved only once
          var then = value.then;

          if (typeof then === 'function') {
            then.call(value, function (val) {
              if (!resolved) {
                resolved = true;

                if (value === val) {
                  fulfill(promise, val);
                } else {
                  resolve(promise, val);
                }
              }
            }, function (reason) {
              if (!resolved) {
                resolved = true;
                reject(promise, reason);
              }
            });
            return true;
          }
        }
      } catch (e) {
        if (!resolved) {
          reject(promise, e);
        }

        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value || !handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state === PENDING) {
        promise._state = SETTLED;
        promise._data = value;
        asyncCall(publishFulfillment, promise);
      }
    }

    function reject(promise, reason) {
      if (promise._state === PENDING) {
        promise._state = SETTLED;
        promise._data = reason;
        asyncCall(publishRejection, promise);
      }
    }

    function publish(promise) {
      promise._then = promise._then.forEach(invokeCallback);
    }

    function publishFulfillment(promise) {
      promise._state = FULFILLED;
      publish(promise);
    }

    function publishRejection(promise) {
      promise._state = REJECTED;
      publish(promise);

      if (!promise._handled && isNode) {
        global.process.emit('unhandledRejection', promise._data, promise);
      }
    }

    function notifyRejectionHandled(promise) {
      global.process.emit('rejectionHandled', promise);
    }
    /**
     * @class
     */


    function P(resolver) {
      if (typeof resolver !== 'function') {
        throw new TypeError('Promise resolver ' + resolver + ' is not a function');
      }

      if (this instanceof P === false) {
        throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
      }

      this._then = [];
      invokeResolver(resolver, this);
    }

    P.prototype = {
      constructor: P,
      _state: PENDING,
      _then: null,
      _data: undefined,
      _handled: false,
      then: function then(onFulfillment, onRejection) {
        var subscriber = {
          owner: this,
          then: new this.constructor(NOOP),
          fulfilled: onFulfillment,
          rejected: onRejection
        };

        if ((onRejection || onFulfillment) && !this._handled) {
          this._handled = true;

          if (this._state === REJECTED && isNode) {
            asyncCall(notifyRejectionHandled, this);
          }
        }

        if (this._state === FULFILLED || this._state === REJECTED) {
          // already resolved, call callback async
          asyncCall(invokeCallback, subscriber);
        } else {
          // subscribe
          this._then.push(subscriber);
        }

        return subscriber.then;
      },
      catch: function _catch(onRejection) {
        return this.then(null, onRejection);
      }
    };

    P.all = function (promises) {
      if (!Array.isArray(promises)) {
        throw new TypeError('You must pass an array to Promise.all().');
      }

      return new P(function (resolve, reject) {
        var results = [];
        var remaining = 0;

        function resolver(index) {
          remaining++;
          return function (value) {
            results[index] = value;

            if (! --remaining) {
              resolve(results);
            }
          };
        }

        for (var i = 0, promise; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolver(i), reject);
          } else {
            results[i] = promise;
          }
        }

        if (!remaining) {
          resolve(results);
        }
      });
    };

    P.race = function (promises) {
      if (!Array.isArray(promises)) {
        throw new TypeError('You must pass an array to Promise.race().');
      }

      return new P(function (resolve, reject) {
        for (var i = 0, promise; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    };

    P.resolve = function (value) {
      if (value && _typeof(value) === 'object' && value.constructor === P) {
        return value;
      }

      return new P(function (resolve) {
        resolve(value);
      });
    };

    P.reject = function (reason) {
      return new P(function (resolve, reject) {
        reject(reason);
      });
    };

    var picked = typeof Promise === 'function' ? Promise : P;

    var d = UNITS_IN_GRID;
    var meaninglessTransform = {
      size: 16,
      x: 0,
      y: 0,
      rotate: 0,
      flipX: false,
      flipY: false
    };

    function isReserved(name) {
      return ~RESERVED_CLASSES.indexOf(name);
    }
    function insertCss(css) {
      if (!css || !IS_DOM) {
        return;
      }

      var style = DOCUMENT.createElement('style');
      style.setAttribute('type', 'text/css');
      style.innerHTML = css;
      var headChildren = DOCUMENT.head.childNodes;
      var beforeChild = null;

      for (var i = headChildren.length - 1; i > -1; i--) {
        var child = headChildren[i];
        var tagName = (child.tagName || '').toUpperCase();

        if (['STYLE', 'LINK'].indexOf(tagName) > -1) {
          beforeChild = child;
        }
      }

      DOCUMENT.head.insertBefore(style, beforeChild);
      return css;
    }
    var idPool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function nextUniqueId() {
      var size = 12;
      var id = '';

      while (size-- > 0) {
        id += idPool[Math.random() * 62 | 0];
      }

      return id;
    }
    function toArray(obj) {
      var array = [];

      for (var i = (obj || []).length >>> 0; i--;) {
        array[i] = obj[i];
      }

      return array;
    }
    function classArray(node) {
      if (node.classList) {
        return toArray(node.classList);
      } else {
        return (node.getAttribute('class') || '').split(' ').filter(function (i) {
          return i;
        });
      }
    }
    function getIconName(familyPrefix, cls) {
      var parts = cls.split('-');
      var prefix = parts[0];
      var iconName = parts.slice(1).join('-');

      if (prefix === familyPrefix && iconName !== '' && !isReserved(iconName)) {
        return iconName;
      } else {
        return null;
      }
    }
    function htmlEscape(str) {
      return "".concat(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function joinAttributes(attributes) {
      return Object.keys(attributes || {}).reduce(function (acc, attributeName) {
        return acc + "".concat(attributeName, "=\"").concat(htmlEscape(attributes[attributeName]), "\" ");
      }, '').trim();
    }
    function joinStyles(styles) {
      return Object.keys(styles || {}).reduce(function (acc, styleName) {
        return acc + "".concat(styleName, ": ").concat(styles[styleName], ";");
      }, '');
    }
    function transformIsMeaningful(transform) {
      return transform.size !== meaninglessTransform.size || transform.x !== meaninglessTransform.x || transform.y !== meaninglessTransform.y || transform.rotate !== meaninglessTransform.rotate || transform.flipX || transform.flipY;
    }
    function transformForSvg(_ref) {
      var transform = _ref.transform,
          containerWidth = _ref.containerWidth,
          iconWidth = _ref.iconWidth;
      var outer = {
        transform: "translate(".concat(containerWidth / 2, " 256)")
      };
      var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
      var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
      var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
      var inner = {
        transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
      };
      var path = {
        transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
      };
      return {
        outer: outer,
        inner: inner,
        path: path
      };
    }
    function transformForCss(_ref2) {
      var transform = _ref2.transform,
          _ref2$width = _ref2.width,
          width = _ref2$width === void 0 ? UNITS_IN_GRID : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? UNITS_IN_GRID : _ref2$height,
          _ref2$startCentered = _ref2.startCentered,
          startCentered = _ref2$startCentered === void 0 ? false : _ref2$startCentered;
      var val = '';

      if (startCentered && IS_IE) {
        val += "translate(".concat(transform.x / d - width / 2, "em, ").concat(transform.y / d - height / 2, "em) ");
      } else if (startCentered) {
        val += "translate(calc(-50% + ".concat(transform.x / d, "em), calc(-50% + ").concat(transform.y / d, "em)) ");
      } else {
        val += "translate(".concat(transform.x / d, "em, ").concat(transform.y / d, "em) ");
      }

      val += "scale(".concat(transform.size / d * (transform.flipX ? -1 : 1), ", ").concat(transform.size / d * (transform.flipY ? -1 : 1), ") ");
      val += "rotate(".concat(transform.rotate, "deg) ");
      return val;
    }

    var ALL_SPACE = {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%'
    };

    function fillBlack(abstract) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (abstract.attributes && (abstract.attributes.fill || force)) {
        abstract.attributes.fill = 'black';
      }

      return abstract;
    }

    function deGroup(abstract) {
      if (abstract.tag === 'g') {
        return abstract.children;
      } else {
        return [abstract];
      }
    }

    function makeIconMasking (_ref) {
      var children = _ref.children,
          attributes = _ref.attributes,
          main = _ref.main,
          mask = _ref.mask,
          explicitMaskId = _ref.maskId,
          transform = _ref.transform;
      var mainWidth = main.width,
          mainPath = main.icon;
      var maskWidth = mask.width,
          maskPath = mask.icon;
      var trans = transformForSvg({
        transform: transform,
        containerWidth: maskWidth,
        iconWidth: mainWidth
      });
      var maskRect = {
        tag: 'rect',
        attributes: _objectSpread({}, ALL_SPACE, {
          fill: 'white'
        })
      };
      var maskInnerGroupChildrenMixin = mainPath.children ? {
        children: mainPath.children.map(fillBlack)
      } : {};
      var maskInnerGroup = {
        tag: 'g',
        attributes: _objectSpread({}, trans.inner),
        children: [fillBlack(_objectSpread({
          tag: mainPath.tag,
          attributes: _objectSpread({}, mainPath.attributes, trans.path)
        }, maskInnerGroupChildrenMixin))]
      };
      var maskOuterGroup = {
        tag: 'g',
        attributes: _objectSpread({}, trans.outer),
        children: [maskInnerGroup]
      };
      var maskId = "mask-".concat(explicitMaskId || nextUniqueId());
      var clipId = "clip-".concat(explicitMaskId || nextUniqueId());
      var maskTag = {
        tag: 'mask',
        attributes: _objectSpread({}, ALL_SPACE, {
          id: maskId,
          maskUnits: 'userSpaceOnUse',
          maskContentUnits: 'userSpaceOnUse'
        }),
        children: [maskRect, maskOuterGroup]
      };
      var defs = {
        tag: 'defs',
        children: [{
          tag: 'clipPath',
          attributes: {
            id: clipId
          },
          children: deGroup(maskPath)
        }, maskTag]
      };
      children.push(defs, {
        tag: 'rect',
        attributes: _objectSpread({
          fill: 'currentColor',
          'clip-path': "url(#".concat(clipId, ")"),
          mask: "url(#".concat(maskId, ")")
        }, ALL_SPACE)
      });
      return {
        children: children,
        attributes: attributes
      };
    }

    function makeIconStandard (_ref) {
      var children = _ref.children,
          attributes = _ref.attributes,
          main = _ref.main,
          transform = _ref.transform,
          styles = _ref.styles;
      var styleString = joinStyles(styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      if (transformIsMeaningful(transform)) {
        var trans = transformForSvg({
          transform: transform,
          containerWidth: main.width,
          iconWidth: main.width
        });
        children.push({
          tag: 'g',
          attributes: _objectSpread({}, trans.outer),
          children: [{
            tag: 'g',
            attributes: _objectSpread({}, trans.inner),
            children: [{
              tag: main.icon.tag,
              children: main.icon.children,
              attributes: _objectSpread({}, main.icon.attributes, trans.path)
            }]
          }]
        });
      } else {
        children.push(main.icon);
      }

      return {
        children: children,
        attributes: attributes
      };
    }

    function asIcon (_ref) {
      var children = _ref.children,
          main = _ref.main,
          mask = _ref.mask,
          attributes = _ref.attributes,
          styles = _ref.styles,
          transform = _ref.transform;

      if (transformIsMeaningful(transform) && main.found && !mask.found) {
        var width = main.width,
            height = main.height;
        var offset = {
          x: width / height / 2,
          y: 0.5
        };
        attributes['style'] = joinStyles(_objectSpread({}, styles, {
          'transform-origin': "".concat(offset.x + transform.x / 16, "em ").concat(offset.y + transform.y / 16, "em")
        }));
      }

      return [{
        tag: 'svg',
        attributes: attributes,
        children: children
      }];
    }

    function asSymbol (_ref) {
      var prefix = _ref.prefix,
          iconName = _ref.iconName,
          children = _ref.children,
          attributes = _ref.attributes,
          symbol = _ref.symbol;
      var id = symbol === true ? "".concat(prefix, "-").concat(config.familyPrefix, "-").concat(iconName) : symbol;
      return [{
        tag: 'svg',
        attributes: {
          style: 'display: none;'
        },
        children: [{
          tag: 'symbol',
          attributes: _objectSpread({}, attributes, {
            id: id
          }),
          children: children
        }]
      }];
    }

    function makeInlineSvgAbstract(params) {
      var _params$icons = params.icons,
          main = _params$icons.main,
          mask = _params$icons.mask,
          prefix = params.prefix,
          iconName = params.iconName,
          transform = params.transform,
          symbol = params.symbol,
          title = params.title,
          maskId = params.maskId,
          titleId = params.titleId,
          extra = params.extra,
          _params$watchable = params.watchable,
          watchable = _params$watchable === void 0 ? false : _params$watchable;

      var _ref = mask.found ? mask : main,
          width = _ref.width,
          height = _ref.height;

      var isUploadedIcon = prefix === 'fak';
      var widthClass = isUploadedIcon ? '' : "fa-w-".concat(Math.ceil(width / height * 16));
      var attrClass = [config.replacementClass, iconName ? "".concat(config.familyPrefix, "-").concat(iconName) : '', widthClass].filter(function (c) {
        return extra.classes.indexOf(c) === -1;
      }).filter(function (c) {
        return c !== '' || !!c;
      }).concat(extra.classes).join(' ');
      var content = {
        children: [],
        attributes: _objectSpread({}, extra.attributes, {
          'data-prefix': prefix,
          'data-icon': iconName,
          'class': attrClass,
          'role': extra.attributes.role || 'img',
          'xmlns': 'http://www.w3.org/2000/svg',
          'viewBox': "0 0 ".concat(width, " ").concat(height)
        })
      };
      var uploadedIconWidthStyle = isUploadedIcon && !~extra.classes.indexOf('fa-fw') ? {
        width: "".concat(width / height * 16 * 0.0625, "em")
      } : {};

      if (watchable) {
        content.attributes[DATA_FA_I2SVG] = '';
      }

      if (title) content.children.push({
        tag: 'title',
        attributes: {
          id: content.attributes['aria-labelledby'] || "title-".concat(titleId || nextUniqueId())
        },
        children: [title]
      });

      var args = _objectSpread({}, content, {
        prefix: prefix,
        iconName: iconName,
        main: main,
        mask: mask,
        maskId: maskId,
        transform: transform,
        symbol: symbol,
        styles: _objectSpread({}, uploadedIconWidthStyle, extra.styles)
      });

      var _ref2 = mask.found && main.found ? makeIconMasking(args) : makeIconStandard(args),
          children = _ref2.children,
          attributes = _ref2.attributes;

      args.children = children;
      args.attributes = attributes;

      if (symbol) {
        return asSymbol(args);
      } else {
        return asIcon(args);
      }
    }
    function makeLayersTextAbstract(params) {
      var content = params.content,
          width = params.width,
          height = params.height,
          transform = params.transform,
          title = params.title,
          extra = params.extra,
          _params$watchable2 = params.watchable,
          watchable = _params$watchable2 === void 0 ? false : _params$watchable2;

      var attributes = _objectSpread({}, extra.attributes, title ? {
        'title': title
      } : {}, {
        'class': extra.classes.join(' ')
      });

      if (watchable) {
        attributes[DATA_FA_I2SVG] = '';
      }

      var styles = _objectSpread({}, extra.styles);

      if (transformIsMeaningful(transform)) {
        styles['transform'] = transformForCss({
          transform: transform,
          startCentered: true,
          width: width,
          height: height
        });
        styles['-webkit-transform'] = styles['transform'];
      }

      var styleString = joinStyles(styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      var val = [];
      val.push({
        tag: 'span',
        attributes: attributes,
        children: [content]
      });

      if (title) {
        val.push({
          tag: 'span',
          attributes: {
            class: 'sr-only'
          },
          children: [title]
        });
      }

      return val;
    }
    function makeLayersCounterAbstract(params) {
      var content = params.content,
          title = params.title,
          extra = params.extra;

      var attributes = _objectSpread({}, extra.attributes, title ? {
        'title': title
      } : {}, {
        'class': extra.classes.join(' ')
      });

      var styleString = joinStyles(extra.styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      var val = [];
      val.push({
        tag: 'span',
        attributes: attributes,
        children: [content]
      });

      if (title) {
        val.push({
          tag: 'span',
          attributes: {
            class: 'sr-only'
          },
          children: [title]
        });
      }

      return val;
    }

    var noop$1$1 = function noop() {};

    var p = config.measurePerformance && PERFORMANCE && PERFORMANCE.mark && PERFORMANCE.measure ? PERFORMANCE : {
      mark: noop$1$1,
      measure: noop$1$1
    };
    var preamble = "FA \"5.15.1\"";

    var begin = function begin(name) {
      p.mark("".concat(preamble, " ").concat(name, " begins"));
      return function () {
        return end(name);
      };
    };

    var end = function end(name) {
      p.mark("".concat(preamble, " ").concat(name, " ends"));
      p.measure("".concat(preamble, " ").concat(name), "".concat(preamble, " ").concat(name, " begins"), "".concat(preamble, " ").concat(name, " ends"));
    };

    var perf = {
      begin: begin,
      end: end
    };

    /**
     * Internal helper to bind a function known to have 4 arguments
     * to a given context.
     */

    var bindInternal4 = function bindInternal4(func, thisContext) {
      return function (a, b, c, d) {
        return func.call(thisContext, a, b, c, d);
      };
    };

    /**
     * # Reduce
     *
     * A fast object `.reduce()` implementation.
     *
     * @param  {Object}   subject      The object to reduce over.
     * @param  {Function} fn           The reducer function.
     * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
     * @param  {Object}   thisContext  The context for the reducer.
     * @return {mixed}                 The final result.
     */


    var reduce = function fastReduceObject(subject, fn, initialValue, thisContext) {
      var keys = Object.keys(subject),
          length = keys.length,
          iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
          i,
          key,
          result;

      if (initialValue === undefined) {
        i = 1;
        result = subject[keys[0]];
      } else {
        i = 0;
        result = initialValue;
      }

      for (; i < length; i++) {
        key = keys[i];
        result = iterator(result, subject[key], key, subject);
      }

      return result;
    };

    function toHex(unicode) {
      var result = '';

      for (var i = 0; i < unicode.length; i++) {
        var hex = unicode.charCodeAt(i).toString(16);
        result += ('000' + hex).slice(-4);
      }

      return result;
    }
    function codePointAt(string, index) {
      /*! https://mths.be/codepointat v0.2.0 by @mathias */
      var size = string.length;
      var first = string.charCodeAt(index);
      var second;

      if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
        second = string.charCodeAt(index + 1);

        if (second >= 0xDC00 && second <= 0xDFFF) {
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }

      return first;
    }
    /**
     * Used to check that the character is between the E000..F8FF private unicode
     * range
     */

    function isPrivateUnicode(iconName) {
      if (iconName.length !== 1) {
        return false;
      } else {
        var cp = codePointAt(iconName, 0);
        return cp >= 57344 && cp <= 63743;
      }
    }

    function defineIcons(prefix, icons) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _params$skipHooks = params.skipHooks,
          skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
      var normalized = Object.keys(icons).reduce(function (acc, iconName) {
        var icon = icons[iconName];
        var expanded = !!icon.icon;

        if (expanded) {
          acc[icon.iconName] = icon.icon;
        } else {
          acc[iconName] = icon;
        }

        return acc;
      }, {});

      if (typeof namespace.hooks.addPack === 'function' && !skipHooks) {
        namespace.hooks.addPack(prefix, normalized);
      } else {
        namespace.styles[prefix] = _objectSpread({}, namespace.styles[prefix] || {}, normalized);
      }
      /**
       * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
       * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
       * for `fas` so we'll easy the upgrade process for our users by automatically defining
       * this as well.
       */


      if (prefix === 'fas') {
        defineIcons('fa', icons);
      }
    }

    var styles = namespace.styles,
        shims = namespace.shims;
    var _byUnicode = {};
    var _byLigature = {};
    var _byOldName = {};
    var build = function build() {
      var lookup = function lookup(reducer) {
        return reduce(styles, function (o, style, prefix) {
          o[prefix] = reduce(style, reducer, {});
          return o;
        }, {});
      };

      _byUnicode = lookup(function (acc, icon, iconName) {
        if (icon[3]) {
          acc[icon[3]] = iconName;
        }

        return acc;
      });
      _byLigature = lookup(function (acc, icon, iconName) {
        var ligatures = icon[2];
        acc[iconName] = iconName;
        ligatures.forEach(function (ligature) {
          acc[ligature] = iconName;
        });
        return acc;
      });
      var hasRegular = 'far' in styles;
      _byOldName = reduce(shims, function (acc, shim) {
        var oldName = shim[0];
        var prefix = shim[1];
        var iconName = shim[2];

        if (prefix === 'far' && !hasRegular) {
          prefix = 'fas';
        }

        acc[oldName] = {
          prefix: prefix,
          iconName: iconName
        };
        return acc;
      }, {});
    };
    build();
    function byUnicode(prefix, unicode) {
      return (_byUnicode[prefix] || {})[unicode];
    }
    function byLigature(prefix, ligature) {
      return (_byLigature[prefix] || {})[ligature];
    }
    function byOldName(name) {
      return _byOldName[name] || {
        prefix: null,
        iconName: null
      };
    }

    var styles$1 = namespace.styles;
    var emptyCanonicalIcon = function emptyCanonicalIcon() {
      return {
        prefix: null,
        iconName: null,
        rest: []
      };
    };
    function getCanonicalIcon(values) {
      return values.reduce(function (acc, cls) {
        var iconName = getIconName(config.familyPrefix, cls);

        if (styles$1[cls]) {
          acc.prefix = cls;
        } else if (config.autoFetchSvg && Object.keys(PREFIX_TO_STYLE).indexOf(cls) > -1) {
          acc.prefix = cls;
        } else if (iconName) {
          var shim = acc.prefix === 'fa' ? byOldName(iconName) : {};
          acc.iconName = shim.iconName || iconName;
          acc.prefix = shim.prefix || acc.prefix;
        } else if (cls !== config.replacementClass && cls.indexOf('fa-w-') !== 0) {
          acc.rest.push(cls);
        }

        return acc;
      }, emptyCanonicalIcon());
    }
    function iconFromMapping(mapping, prefix, iconName) {
      if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
        return {
          prefix: prefix,
          iconName: iconName,
          icon: mapping[prefix][iconName]
        };
      }
    }

    function toHtml(abstractNodes) {
      var tag = abstractNodes.tag,
          _abstractNodes$attrib = abstractNodes.attributes,
          attributes = _abstractNodes$attrib === void 0 ? {} : _abstractNodes$attrib,
          _abstractNodes$childr = abstractNodes.children,
          children = _abstractNodes$childr === void 0 ? [] : _abstractNodes$childr;

      if (typeof abstractNodes === 'string') {
        return htmlEscape(abstractNodes);
      } else {
        return "<".concat(tag, " ").concat(joinAttributes(attributes), ">").concat(children.map(toHtml).join(''), "</").concat(tag, ">");
      }
    }

    var noop$2 = function noop() {};

    function isWatched(node) {
      var i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
      return typeof i2svg === 'string';
    }

    function getMutator() {
      if (config.autoReplaceSvg === true) {
        return mutators.replace;
      }

      var mutator = mutators[config.autoReplaceSvg];
      return mutator || mutators.replace;
    }

    var mutators = {
      replace: function replace(mutation) {
        var node = mutation[0];
        var abstract = mutation[1];
        var newOuterHTML = abstract.map(function (a) {
          return toHtml(a);
        }).join('\n');

        if (node.parentNode && node.outerHTML) {
          node.outerHTML = newOuterHTML + (config.keepOriginalSource && node.tagName.toLowerCase() !== 'svg' ? "<!-- ".concat(node.outerHTML, " Font Awesome fontawesome.com -->") : '');
        } else if (node.parentNode) {
          var newNode = document.createElement('span');
          node.parentNode.replaceChild(newNode, node);
          newNode.outerHTML = newOuterHTML;
        }
      },
      nest: function nest(mutation) {
        var node = mutation[0];
        var abstract = mutation[1]; // If we already have a replaced node we do not want to continue nesting within it.
        // Short-circuit to the standard replacement

        if (~classArray(node).indexOf(config.replacementClass)) {
          return mutators.replace(mutation);
        }

        var forSvg = new RegExp("".concat(config.familyPrefix, "-.*"));
        delete abstract[0].attributes.style;
        delete abstract[0].attributes.id;
        var splitClasses = abstract[0].attributes.class.split(' ').reduce(function (acc, cls) {
          if (cls === config.replacementClass || cls.match(forSvg)) {
            acc.toSvg.push(cls);
          } else {
            acc.toNode.push(cls);
          }

          return acc;
        }, {
          toNode: [],
          toSvg: []
        });
        abstract[0].attributes.class = splitClasses.toSvg.join(' ');
        var newInnerHTML = abstract.map(function (a) {
          return toHtml(a);
        }).join('\n');
        node.setAttribute('class', splitClasses.toNode.join(' '));
        node.setAttribute(DATA_FA_I2SVG, '');
        node.innerHTML = newInnerHTML;
      }
    };

    function performOperationSync(op) {
      op();
    }

    function perform(mutations, callback) {
      var callbackFunction = typeof callback === 'function' ? callback : noop$2;

      if (mutations.length === 0) {
        callbackFunction();
      } else {
        var frame = performOperationSync;

        if (config.mutateApproach === MUTATION_APPROACH_ASYNC) {
          frame = WINDOW.requestAnimationFrame || performOperationSync;
        }

        frame(function () {
          var mutator = getMutator();
          var mark = perf.begin('mutate');
          mutations.map(mutator);
          mark();
          callbackFunction();
        });
      }
    }
    var disabled = false;
    function disableObservation() {
      disabled = true;
    }
    function enableObservation() {
      disabled = false;
    }
    var mo = null;
    function observe(options) {
      if (!MUTATION_OBSERVER) {
        return;
      }

      if (!config.observeMutations) {
        return;
      }

      var treeCallback = options.treeCallback,
          nodeCallback = options.nodeCallback,
          pseudoElementsCallback = options.pseudoElementsCallback,
          _options$observeMutat = options.observeMutationsRoot,
          observeMutationsRoot = _options$observeMutat === void 0 ? DOCUMENT : _options$observeMutat;
      mo = new MUTATION_OBSERVER(function (objects) {
        if (disabled) return;
        toArray(objects).forEach(function (mutationRecord) {
          if (mutationRecord.type === 'childList' && mutationRecord.addedNodes.length > 0 && !isWatched(mutationRecord.addedNodes[0])) {
            if (config.searchPseudoElements) {
              pseudoElementsCallback(mutationRecord.target);
            }

            treeCallback(mutationRecord.target);
          }

          if (mutationRecord.type === 'attributes' && mutationRecord.target.parentNode && config.searchPseudoElements) {
            pseudoElementsCallback(mutationRecord.target.parentNode);
          }

          if (mutationRecord.type === 'attributes' && isWatched(mutationRecord.target) && ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)) {
            if (mutationRecord.attributeName === 'class') {
              var _getCanonicalIcon = getCanonicalIcon(classArray(mutationRecord.target)),
                  prefix = _getCanonicalIcon.prefix,
                  iconName = _getCanonicalIcon.iconName;

              if (prefix) mutationRecord.target.setAttribute('data-prefix', prefix);
              if (iconName) mutationRecord.target.setAttribute('data-icon', iconName);
            } else {
              nodeCallback(mutationRecord.target);
            }
          }
        });
      });
      if (!IS_DOM) return;
      mo.observe(observeMutationsRoot, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      });
    }
    function disconnect() {
      if (!mo) return;
      mo.disconnect();
    }

    function styleParser (node) {
      var style = node.getAttribute('style');
      var val = [];

      if (style) {
        val = style.split(';').reduce(function (acc, style) {
          var styles = style.split(':');
          var prop = styles[0];
          var value = styles.slice(1);

          if (prop && value.length > 0) {
            acc[prop] = value.join(':').trim();
          }

          return acc;
        }, {});
      }

      return val;
    }

    function classParser (node) {
      var existingPrefix = node.getAttribute('data-prefix');
      var existingIconName = node.getAttribute('data-icon');
      var innerText = node.innerText !== undefined ? node.innerText.trim() : '';
      var val = getCanonicalIcon(classArray(node));

      if (existingPrefix && existingIconName) {
        val.prefix = existingPrefix;
        val.iconName = existingIconName;
      }

      if (val.prefix && innerText.length > 1) {
        val.iconName = byLigature(val.prefix, node.innerText);
      } else if (val.prefix && innerText.length === 1) {
        val.iconName = byUnicode(val.prefix, toHex(node.innerText));
      }

      return val;
    }

    var parseTransformString = function parseTransformString(transformString) {
      var transform = {
        size: 16,
        x: 0,
        y: 0,
        flipX: false,
        flipY: false,
        rotate: 0
      };

      if (!transformString) {
        return transform;
      } else {
        return transformString.toLowerCase().split(' ').reduce(function (acc, n) {
          var parts = n.toLowerCase().split('-');
          var first = parts[0];
          var rest = parts.slice(1).join('-');

          if (first && rest === 'h') {
            acc.flipX = true;
            return acc;
          }

          if (first && rest === 'v') {
            acc.flipY = true;
            return acc;
          }

          rest = parseFloat(rest);

          if (isNaN(rest)) {
            return acc;
          }

          switch (first) {
            case 'grow':
              acc.size = acc.size + rest;
              break;

            case 'shrink':
              acc.size = acc.size - rest;
              break;

            case 'left':
              acc.x = acc.x - rest;
              break;

            case 'right':
              acc.x = acc.x + rest;
              break;

            case 'up':
              acc.y = acc.y - rest;
              break;

            case 'down':
              acc.y = acc.y + rest;
              break;

            case 'rotate':
              acc.rotate = acc.rotate + rest;
              break;
          }

          return acc;
        }, transform);
      }
    };
    function transformParser (node) {
      return parseTransformString(node.getAttribute('data-fa-transform'));
    }

    function symbolParser (node) {
      var symbol = node.getAttribute('data-fa-symbol');
      return symbol === null ? false : symbol === '' ? true : symbol;
    }

    function attributesParser (node) {
      var extraAttributes = toArray(node.attributes).reduce(function (acc, attr) {
        if (acc.name !== 'class' && acc.name !== 'style') {
          acc[attr.name] = attr.value;
        }

        return acc;
      }, {});
      var title = node.getAttribute('title');
      var titleId = node.getAttribute('data-fa-title-id');

      if (config.autoA11y) {
        if (title) {
          extraAttributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
        } else {
          extraAttributes['aria-hidden'] = 'true';
          extraAttributes['focusable'] = 'false';
        }
      }

      return extraAttributes;
    }

    function maskParser (node) {
      var mask = node.getAttribute('data-fa-mask');

      if (!mask) {
        return emptyCanonicalIcon();
      } else {
        return getCanonicalIcon(mask.split(' ').map(function (i) {
          return i.trim();
        }));
      }
    }

    function blankMeta() {
      return {
        iconName: null,
        title: null,
        titleId: null,
        prefix: null,
        transform: meaninglessTransform,
        symbol: false,
        mask: null,
        maskId: null,
        extra: {
          classes: [],
          styles: {},
          attributes: {}
        }
      };
    }
    function parseMeta(node) {
      var _classParser = classParser(node),
          iconName = _classParser.iconName,
          prefix = _classParser.prefix,
          extraClasses = _classParser.rest;

      var extraStyles = styleParser(node);
      var transform = transformParser(node);
      var symbol = symbolParser(node);
      var extraAttributes = attributesParser(node);
      var mask = maskParser(node);
      return {
        iconName: iconName,
        title: node.getAttribute('title'),
        titleId: node.getAttribute('data-fa-title-id'),
        prefix: prefix,
        transform: transform,
        symbol: symbol,
        mask: mask,
        maskId: node.getAttribute('data-fa-mask-id'),
        extra: {
          classes: extraClasses,
          styles: extraStyles,
          attributes: extraAttributes
        }
      };
    }

    function MissingIcon(error) {
      this.name = 'MissingIcon';
      this.message = error || 'Icon unavailable';
      this.stack = new Error().stack;
    }
    MissingIcon.prototype = Object.create(Error.prototype);
    MissingIcon.prototype.constructor = MissingIcon;

    var FILL = {
      fill: 'currentColor'
    };
    var ANIMATION_BASE = {
      attributeType: 'XML',
      repeatCount: 'indefinite',
      dur: '2s'
    };
    var RING = {
      tag: 'path',
      attributes: _objectSpread({}, FILL, {
        d: 'M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z'
      })
    };

    var OPACITY_ANIMATE = _objectSpread({}, ANIMATION_BASE, {
      attributeName: 'opacity'
    });

    var DOT = {
      tag: 'circle',
      attributes: _objectSpread({}, FILL, {
        cx: '256',
        cy: '364',
        r: '28'
      }),
      children: [{
        tag: 'animate',
        attributes: _objectSpread({}, ANIMATION_BASE, {
          attributeName: 'r',
          values: '28;14;28;28;14;28;'
        })
      }, {
        tag: 'animate',
        attributes: _objectSpread({}, OPACITY_ANIMATE, {
          values: '1;0;1;1;0;1;'
        })
      }]
    };
    var QUESTION = {
      tag: 'path',
      attributes: _objectSpread({}, FILL, {
        opacity: '1',
        d: 'M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z'
      }),
      children: [{
        tag: 'animate',
        attributes: _objectSpread({}, OPACITY_ANIMATE, {
          values: '1;0;0;0;0;1;'
        })
      }]
    };
    var EXCLAMATION = {
      tag: 'path',
      attributes: _objectSpread({}, FILL, {
        opacity: '0',
        d: 'M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z'
      }),
      children: [{
        tag: 'animate',
        attributes: _objectSpread({}, OPACITY_ANIMATE, {
          values: '0;0;1;1;0;0;'
        })
      }]
    };
    var missing = {
      tag: 'g',
      children: [RING, DOT, QUESTION, EXCLAMATION]
    };

    var styles$2 = namespace.styles;
    function resolveCustomIconVersion() {
      var kitConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var iconName = arguments.length > 1 ? arguments[1] : undefined;

      if (iconName && isPrivateUnicode(iconName)) {
        if (kitConfig && kitConfig.iconUploads) {
          var iconUploads = kitConfig.iconUploads;
          var descriptiveIconName = Object.keys(iconUploads).find(function (key) {
            return iconUploads[key] && iconUploads[key].u && iconUploads[key].u === toHex(iconName);
          });

          if (descriptiveIconName) {
            return iconUploads[descriptiveIconName].v;
          }
        }
      } else {
        if (kitConfig && kitConfig.iconUploads && kitConfig.iconUploads[iconName] && kitConfig.iconUploads[iconName].v) {
          return kitConfig.iconUploads[iconName].v;
        }
      }
    }
    function asFoundIcon(icon) {
      var width = icon[0];
      var height = icon[1];

      var _icon$slice = icon.slice(4),
          _icon$slice2 = _slicedToArray(_icon$slice, 1),
          vectorData = _icon$slice2[0];

      var element = null;

      if (Array.isArray(vectorData)) {
        element = {
          tag: 'g',
          attributes: {
            class: "".concat(config.familyPrefix, "-").concat(DUOTONE_CLASSES.GROUP)
          },
          children: [{
            tag: 'path',
            attributes: {
              class: "".concat(config.familyPrefix, "-").concat(DUOTONE_CLASSES.SECONDARY),
              fill: 'currentColor',
              d: vectorData[0]
            }
          }, {
            tag: 'path',
            attributes: {
              class: "".concat(config.familyPrefix, "-").concat(DUOTONE_CLASSES.PRIMARY),
              fill: 'currentColor',
              d: vectorData[1]
            }
          }]
        };
      } else {
        element = {
          tag: 'path',
          attributes: {
            fill: 'currentColor',
            d: vectorData
          }
        };
      }

      return {
        found: true,
        width: width,
        height: height,
        icon: element
      };
    }
    function findIcon(iconName, prefix) {
      return new picked(function (resolve, reject) {
        var val = {
          found: false,
          width: 512,
          height: 512,
          icon: missing
        };

        if (iconName && prefix && styles$2[prefix] && styles$2[prefix][iconName]) {
          var icon = styles$2[prefix][iconName];
          return resolve(asFoundIcon(icon));
        }
        var kitToken = null;
        var iconVersion = resolveCustomIconVersion(WINDOW.FontAwesomeKitConfig, iconName);

        if (WINDOW.FontAwesomeKitConfig && WINDOW.FontAwesomeKitConfig.token) {
          kitToken = WINDOW.FontAwesomeKitConfig.token;
        }

        if (iconName && prefix && !config.showMissingIcons) {
          reject(new MissingIcon("Icon is missing for prefix ".concat(prefix, " with icon name ").concat(iconName)));
        } else {
          resolve(val);
        }
      });
    }

    var styles$3 = namespace.styles;

    function generateSvgReplacementMutation(node, nodeMeta) {
      var iconName = nodeMeta.iconName,
          title = nodeMeta.title,
          titleId = nodeMeta.titleId,
          prefix = nodeMeta.prefix,
          transform = nodeMeta.transform,
          symbol = nodeMeta.symbol,
          mask = nodeMeta.mask,
          maskId = nodeMeta.maskId,
          extra = nodeMeta.extra;
      return new picked(function (resolve, reject) {
        picked.all([findIcon(iconName, prefix), findIcon(mask.iconName, mask.prefix)]).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              main = _ref2[0],
              mask = _ref2[1];

          resolve([node, makeInlineSvgAbstract({
            icons: {
              main: main,
              mask: mask
            },
            prefix: prefix,
            iconName: iconName,
            transform: transform,
            symbol: symbol,
            mask: mask,
            maskId: maskId,
            title: title,
            titleId: titleId,
            extra: extra,
            watchable: true
          })]);
        });
      });
    }

    function generateLayersText(node, nodeMeta) {
      var title = nodeMeta.title,
          transform = nodeMeta.transform,
          extra = nodeMeta.extra;
      var width = null;
      var height = null;

      if (IS_IE) {
        var computedFontSize = parseInt(getComputedStyle(node).fontSize, 10);
        var boundingClientRect = node.getBoundingClientRect();
        width = boundingClientRect.width / computedFontSize;
        height = boundingClientRect.height / computedFontSize;
      }

      if (config.autoA11y && !title) {
        extra.attributes['aria-hidden'] = 'true';
      }

      return picked.resolve([node, makeLayersTextAbstract({
        content: node.innerHTML,
        width: width,
        height: height,
        transform: transform,
        title: title,
        extra: extra,
        watchable: true
      })]);
    }

    function generateMutation(node) {
      var nodeMeta = parseMeta(node);

      if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
        return generateLayersText(node, nodeMeta);
      } else {
        return generateSvgReplacementMutation(node, nodeMeta);
      }
    }

    function onTree(root) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!IS_DOM) return;
      var htmlClassList = DOCUMENT.documentElement.classList;

      var hclAdd = function hclAdd(suffix) {
        return htmlClassList.add("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
      };

      var hclRemove = function hclRemove(suffix) {
        return htmlClassList.remove("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
      };

      var prefixes = config.autoFetchSvg ? Object.keys(PREFIX_TO_STYLE) : Object.keys(styles$3);
      var prefixesDomQuery = [".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])")].concat(prefixes.map(function (p) {
        return ".".concat(p, ":not([").concat(DATA_FA_I2SVG, "])");
      })).join(', ');

      if (prefixesDomQuery.length === 0) {
        return;
      }

      var candidates = [];

      try {
        candidates = toArray(root.querySelectorAll(prefixesDomQuery));
      } catch (e) {// noop
      }

      if (candidates.length > 0) {
        hclAdd('pending');
        hclRemove('complete');
      } else {
        return;
      }

      var mark = perf.begin('onTree');
      var mutations = candidates.reduce(function (acc, node) {
        try {
          var mutation = generateMutation(node);

          if (mutation) {
            acc.push(mutation);
          }
        } catch (e) {
          if (!PRODUCTION) {
            if (e instanceof MissingIcon) {
              console.error(e);
            }
          }
        }

        return acc;
      }, []);
      return new picked(function (resolve, reject) {
        picked.all(mutations).then(function (resolvedMutations) {
          perform(resolvedMutations, function () {
            hclAdd('active');
            hclAdd('complete');
            hclRemove('pending');
            if (typeof callback === 'function') callback();
            mark();
            resolve();
          });
        }).catch(function () {
          mark();
          reject();
        });
      });
    }
    function onNode(node) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      generateMutation(node).then(function (mutation) {
        if (mutation) {
          perform([mutation], callback);
        }
      });
    }

    function replaceForPosition(node, position) {
      var pendingAttribute = "".concat(DATA_FA_PSEUDO_ELEMENT_PENDING).concat(position.replace(':', '-'));
      return new picked(function (resolve, reject) {
        if (node.getAttribute(pendingAttribute) !== null) {
          // This node is already being processed
          return resolve();
        }

        var children = toArray(node.children);
        var alreadyProcessedPseudoElement = children.filter(function (c) {
          return c.getAttribute(DATA_FA_PSEUDO_ELEMENT) === position;
        })[0];
        var styles = WINDOW.getComputedStyle(node, position);
        var fontFamily = styles.getPropertyValue('font-family').match(FONT_FAMILY_PATTERN);
        var fontWeight = styles.getPropertyValue('font-weight');
        var content = styles.getPropertyValue('content');

        if (alreadyProcessedPseudoElement && !fontFamily) {
          // If we've already processed it but the current computed style does not result in a font-family,
          // that probably means that a class name that was previously present to make the icon has been
          // removed. So we now should delete the icon.
          node.removeChild(alreadyProcessedPseudoElement);
          return resolve();
        } else if (fontFamily && content !== 'none' && content !== '') {
          var _content = styles.getPropertyValue('content');

          var prefix = ~['Solid', 'Regular', 'Light', 'Duotone', 'Brands', 'Kit'].indexOf(fontFamily[2]) ? STYLE_TO_PREFIX[fontFamily[2].toLowerCase()] : FONT_WEIGHT_TO_PREFIX[fontWeight];
          var hexValue = toHex(_content.length === 3 ? _content.substr(1, 1) : _content);
          var iconName = byUnicode(prefix, hexValue);
          var iconIdentifier = iconName; // Only convert the pseudo element in this :before/:after position into an icon if we haven't
          // already done so with the same prefix and iconName

          if (iconName && (!alreadyProcessedPseudoElement || alreadyProcessedPseudoElement.getAttribute(DATA_PREFIX) !== prefix || alreadyProcessedPseudoElement.getAttribute(DATA_ICON) !== iconIdentifier)) {
            node.setAttribute(pendingAttribute, iconIdentifier);

            if (alreadyProcessedPseudoElement) {
              // Delete the old one, since we're replacing it with a new one
              node.removeChild(alreadyProcessedPseudoElement);
            }

            var meta = blankMeta();
            var extra = meta.extra;
            extra.attributes[DATA_FA_PSEUDO_ELEMENT] = position;
            findIcon(iconName, prefix).then(function (main) {
              var abstract = makeInlineSvgAbstract(_objectSpread({}, meta, {
                icons: {
                  main: main,
                  mask: emptyCanonicalIcon()
                },
                prefix: prefix,
                iconName: iconIdentifier,
                extra: extra,
                watchable: true
              }));
              var element = DOCUMENT.createElement('svg');

              if (position === ':before') {
                node.insertBefore(element, node.firstChild);
              } else {
                node.appendChild(element);
              }

              element.outerHTML = abstract.map(function (a) {
                return toHtml(a);
              }).join('\n');
              node.removeAttribute(pendingAttribute);
              resolve();
            }).catch(reject);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }

    function replace(node) {
      return picked.all([replaceForPosition(node, ':before'), replaceForPosition(node, ':after')]);
    }

    function processable(node) {
      return node.parentNode !== document.head && !~TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS.indexOf(node.tagName.toUpperCase()) && !node.getAttribute(DATA_FA_PSEUDO_ELEMENT) && (!node.parentNode || node.parentNode.tagName !== 'svg');
    }

    function searchPseudoElements (root) {
      if (!IS_DOM) return;
      return new picked(function (resolve, reject) {
        var operations = toArray(root.querySelectorAll('*')).filter(processable).map(replace);
        var end = perf.begin('searchPseudoElements');
        disableObservation();
        picked.all(operations).then(function () {
          end();
          enableObservation();
          resolve();
        }).catch(function () {
          end();
          enableObservation();
          reject();
        });
      });
    }

    var baseStyles = "svg:not(:root).svg-inline--fa {\n  overflow: visible;\n}\n\n.svg-inline--fa {\n  display: inline-block;\n  font-size: inherit;\n  height: 1em;\n  overflow: visible;\n  vertical-align: -0.125em;\n}\n.svg-inline--fa.fa-lg {\n  vertical-align: -0.225em;\n}\n.svg-inline--fa.fa-w-1 {\n  width: 0.0625em;\n}\n.svg-inline--fa.fa-w-2 {\n  width: 0.125em;\n}\n.svg-inline--fa.fa-w-3 {\n  width: 0.1875em;\n}\n.svg-inline--fa.fa-w-4 {\n  width: 0.25em;\n}\n.svg-inline--fa.fa-w-5 {\n  width: 0.3125em;\n}\n.svg-inline--fa.fa-w-6 {\n  width: 0.375em;\n}\n.svg-inline--fa.fa-w-7 {\n  width: 0.4375em;\n}\n.svg-inline--fa.fa-w-8 {\n  width: 0.5em;\n}\n.svg-inline--fa.fa-w-9 {\n  width: 0.5625em;\n}\n.svg-inline--fa.fa-w-10 {\n  width: 0.625em;\n}\n.svg-inline--fa.fa-w-11 {\n  width: 0.6875em;\n}\n.svg-inline--fa.fa-w-12 {\n  width: 0.75em;\n}\n.svg-inline--fa.fa-w-13 {\n  width: 0.8125em;\n}\n.svg-inline--fa.fa-w-14 {\n  width: 0.875em;\n}\n.svg-inline--fa.fa-w-15 {\n  width: 0.9375em;\n}\n.svg-inline--fa.fa-w-16 {\n  width: 1em;\n}\n.svg-inline--fa.fa-w-17 {\n  width: 1.0625em;\n}\n.svg-inline--fa.fa-w-18 {\n  width: 1.125em;\n}\n.svg-inline--fa.fa-w-19 {\n  width: 1.1875em;\n}\n.svg-inline--fa.fa-w-20 {\n  width: 1.25em;\n}\n.svg-inline--fa.fa-pull-left {\n  margin-right: 0.3em;\n  width: auto;\n}\n.svg-inline--fa.fa-pull-right {\n  margin-left: 0.3em;\n  width: auto;\n}\n.svg-inline--fa.fa-border {\n  height: 1.5em;\n}\n.svg-inline--fa.fa-li {\n  width: 2em;\n}\n.svg-inline--fa.fa-fw {\n  width: 1.25em;\n}\n\n.fa-layers svg.svg-inline--fa {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.fa-layers {\n  display: inline-block;\n  height: 1em;\n  position: relative;\n  text-align: center;\n  vertical-align: -0.125em;\n  width: 1em;\n}\n.fa-layers svg.svg-inline--fa {\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter, .fa-layers-text {\n  display: inline-block;\n  position: absolute;\n  text-align: center;\n}\n\n.fa-layers-text {\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter {\n  background-color: #ff253a;\n  border-radius: 1em;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  color: #fff;\n  height: 1.5em;\n  line-height: 1;\n  max-width: 5em;\n  min-width: 1.5em;\n  overflow: hidden;\n  padding: 0.25em;\n  right: 0;\n  text-overflow: ellipsis;\n  top: 0;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-bottom-right {\n  bottom: 0;\n  right: 0;\n  top: auto;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: bottom right;\n          transform-origin: bottom right;\n}\n\n.fa-layers-bottom-left {\n  bottom: 0;\n  left: 0;\n  right: auto;\n  top: auto;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: bottom left;\n          transform-origin: bottom left;\n}\n\n.fa-layers-top-right {\n  right: 0;\n  top: 0;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-top-left {\n  left: 0;\n  right: auto;\n  top: 0;\n  -webkit-transform: scale(0.25);\n          transform: scale(0.25);\n  -webkit-transform-origin: top left;\n          transform-origin: top left;\n}\n\n.fa-lg {\n  font-size: 1.3333333333em;\n  line-height: 0.75em;\n  vertical-align: -0.0667em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: 2.5em;\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: -2em;\n  position: absolute;\n  text-align: center;\n  width: 2em;\n  line-height: inherit;\n}\n\n.fa-border {\n  border: solid 0.08em #eee;\n  border-radius: 0.1em;\n  padding: 0.2em 0.25em 0.15em;\n}\n\n.fa-pull-left {\n  float: left;\n}\n\n.fa-pull-right {\n  float: right;\n}\n\n.fa.fa-pull-left,\n.fas.fa-pull-left,\n.far.fa-pull-left,\n.fal.fa-pull-left,\n.fab.fa-pull-left {\n  margin-right: 0.3em;\n}\n.fa.fa-pull-right,\n.fas.fa-pull-right,\n.far.fa-pull-right,\n.fal.fa-pull-right,\n.fab.fa-pull-right {\n  margin-left: 0.3em;\n}\n\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n          animation: fa-spin 2s infinite linear;\n}\n\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n          animation: fa-spin 1s infinite steps(8);\n}\n\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)\";\n  -webkit-transform: rotate(90deg);\n          transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)\";\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)\";\n  -webkit-transform: rotate(270deg);\n          transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)\";\n  -webkit-transform: scale(-1, 1);\n          transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";\n  -webkit-transform: scale(1, -1);\n          transform: scale(1, -1);\n}\n\n.fa-flip-both, .fa-flip-horizontal.fa-flip-vertical {\n  -ms-filter: \"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)\";\n  -webkit-transform: scale(-1, -1);\n          transform: scale(-1, -1);\n}\n\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical,\n:root .fa-flip-both {\n  -webkit-filter: none;\n          filter: none;\n}\n\n.fa-stack {\n  display: inline-block;\n  height: 2em;\n  position: relative;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.svg-inline--fa.fa-stack-1x {\n  height: 1em;\n  width: 1.25em;\n}\n.svg-inline--fa.fa-stack-2x {\n  height: 2em;\n  width: 2.5em;\n}\n\n.fa-inverse {\n  color: #fff;\n}\n\n.sr-only {\n  border: 0;\n  clip: rect(0, 0, 0, 0);\n  height: 1px;\n  margin: -1px;\n  overflow: hidden;\n  padding: 0;\n  position: absolute;\n  width: 1px;\n}\n\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  clip: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  position: static;\n  width: auto;\n}\n\n.svg-inline--fa .fa-primary {\n  fill: var(--fa-primary-color, currentColor);\n  opacity: 1;\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa .fa-secondary {\n  fill: var(--fa-secondary-color, currentColor);\n  opacity: 0.4;\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-primary {\n  opacity: 0.4;\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-secondary {\n  opacity: 1;\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa mask .fa-primary,\n.svg-inline--fa mask .fa-secondary {\n  fill: black;\n}\n\n.fad.fa-inverse {\n  color: #fff;\n}";

    function css () {
      var dfp = DEFAULT_FAMILY_PREFIX;
      var drc = DEFAULT_REPLACEMENT_CLASS;
      var fp = config.familyPrefix;
      var rc = config.replacementClass;
      var s = baseStyles;

      if (fp !== dfp || rc !== drc) {
        var dPatt = new RegExp("\\.".concat(dfp, "\\-"), 'g');
        var customPropPatt = new RegExp("\\--".concat(dfp, "\\-"), 'g');
        var rPatt = new RegExp("\\.".concat(drc), 'g');
        s = s.replace(dPatt, ".".concat(fp, "-")).replace(customPropPatt, "--".concat(fp, "-")).replace(rPatt, ".".concat(rc));
      }

      return s;
    }

    var Library =
    /*#__PURE__*/
    function () {
      function Library() {
        _classCallCheck(this, Library);

        this.definitions = {};
      }

      _createClass(Library, [{
        key: "add",
        value: function add() {
          var _this = this;

          for (var _len = arguments.length, definitions = new Array(_len), _key = 0; _key < _len; _key++) {
            definitions[_key] = arguments[_key];
          }

          var additions = definitions.reduce(this._pullDefinitions, {});
          Object.keys(additions).forEach(function (key) {
            _this.definitions[key] = _objectSpread({}, _this.definitions[key] || {}, additions[key]);
            defineIcons(key, additions[key]);
            build();
          });
        }
      }, {
        key: "reset",
        value: function reset() {
          this.definitions = {};
        }
      }, {
        key: "_pullDefinitions",
        value: function _pullDefinitions(additions, definition) {
          var normalized = definition.prefix && definition.iconName && definition.icon ? {
            0: definition
          } : definition;
          Object.keys(normalized).map(function (key) {
            var _normalized$key = normalized[key],
                prefix = _normalized$key.prefix,
                iconName = _normalized$key.iconName,
                icon = _normalized$key.icon;
            if (!additions[prefix]) additions[prefix] = {};
            additions[prefix][iconName] = icon;
          });
          return additions;
        }
      }]);

      return Library;
    }();

    function ensureCss() {
      if (config.autoAddCss && !_cssInserted) {
        insertCss(css());

        _cssInserted = true;
      }
    }

    function apiObject(val, abstractCreator) {
      Object.defineProperty(val, 'abstract', {
        get: abstractCreator
      });
      Object.defineProperty(val, 'html', {
        get: function get() {
          return val.abstract.map(function (a) {
            return toHtml(a);
          });
        }
      });
      Object.defineProperty(val, 'node', {
        get: function get() {
          if (!IS_DOM) return;
          var container = DOCUMENT.createElement('div');
          container.innerHTML = val.html;
          return container.children;
        }
      });
      return val;
    }

    function findIconDefinition(iconLookup) {
      var _iconLookup$prefix = iconLookup.prefix,
          prefix = _iconLookup$prefix === void 0 ? 'fa' : _iconLookup$prefix,
          iconName = iconLookup.iconName;
      if (!iconName) return;
      return iconFromMapping(library.definitions, prefix, iconName) || iconFromMapping(namespace.styles, prefix, iconName);
    }

    function resolveIcons(next) {
      return function (maybeIconDefinition) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var iconDefinition = (maybeIconDefinition || {}).icon ? maybeIconDefinition : findIconDefinition(maybeIconDefinition || {});
        var mask = params.mask;

        if (mask) {
          mask = (mask || {}).icon ? mask : findIconDefinition(mask || {});
        }

        return next(iconDefinition, _objectSpread({}, params, {
          mask: mask
        }));
      };
    }

    var library = new Library();
    var noAuto = function noAuto() {
      config.autoReplaceSvg = false;
      config.observeMutations = false;
      disconnect();
    };
    var _cssInserted = false;
    var dom = {
      i2svg: function i2svg() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (IS_DOM) {
          ensureCss();
          var _params$node = params.node,
              node = _params$node === void 0 ? DOCUMENT : _params$node,
              _params$callback = params.callback,
              callback = _params$callback === void 0 ? function () {} : _params$callback;

          if (config.searchPseudoElements) {
            searchPseudoElements(node);
          }

          return onTree(node, callback);
        } else {
          return picked.reject('Operation requires a DOM of some kind.');
        }
      },
      css: css,
      insertCss: function insertCss$$1() {
        if (!_cssInserted) {
          insertCss(css());

          _cssInserted = true;
        }
      },
      watch: function watch() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var autoReplaceSvgRoot = params.autoReplaceSvgRoot,
            observeMutationsRoot = params.observeMutationsRoot;

        if (config.autoReplaceSvg === false) {
          config.autoReplaceSvg = true;
        }

        config.observeMutations = true;
        domready(function () {
          autoReplace({
            autoReplaceSvgRoot: autoReplaceSvgRoot
          });
          observe({
            treeCallback: onTree,
            nodeCallback: onNode,
            pseudoElementsCallback: searchPseudoElements,
            observeMutationsRoot: observeMutationsRoot
          });
        });
      }
    };
    var parse = {
      transform: function transform(transformString) {
        return parseTransformString(transformString);
      }
    };
    var icon = resolveIcons(function (iconDefinition) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$transform = params.transform,
          transform = _params$transform === void 0 ? meaninglessTransform : _params$transform,
          _params$symbol = params.symbol,
          symbol = _params$symbol === void 0 ? false : _params$symbol,
          _params$mask = params.mask,
          mask = _params$mask === void 0 ? null : _params$mask,
          _params$maskId = params.maskId,
          maskId = _params$maskId === void 0 ? null : _params$maskId,
          _params$title = params.title,
          title = _params$title === void 0 ? null : _params$title,
          _params$titleId = params.titleId,
          titleId = _params$titleId === void 0 ? null : _params$titleId,
          _params$classes = params.classes,
          classes = _params$classes === void 0 ? [] : _params$classes,
          _params$attributes = params.attributes,
          attributes = _params$attributes === void 0 ? {} : _params$attributes,
          _params$styles = params.styles,
          styles = _params$styles === void 0 ? {} : _params$styles;
      if (!iconDefinition) return;
      var prefix = iconDefinition.prefix,
          iconName = iconDefinition.iconName,
          icon = iconDefinition.icon;
      return apiObject(_objectSpread({
        type: 'icon'
      }, iconDefinition), function () {
        ensureCss();

        if (config.autoA11y) {
          if (title) {
            attributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
          } else {
            attributes['aria-hidden'] = 'true';
            attributes['focusable'] = 'false';
          }
        }

        return makeInlineSvgAbstract({
          icons: {
            main: asFoundIcon(icon),
            mask: mask ? asFoundIcon(mask.icon) : {
              found: false,
              width: null,
              height: null,
              icon: {}
            }
          },
          prefix: prefix,
          iconName: iconName,
          transform: _objectSpread({}, meaninglessTransform, transform),
          symbol: symbol,
          title: title,
          maskId: maskId,
          titleId: titleId,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: classes
          }
        });
      });
    });
    var text$1 = function text(content) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$transform2 = params.transform,
          transform = _params$transform2 === void 0 ? meaninglessTransform : _params$transform2,
          _params$title2 = params.title,
          title = _params$title2 === void 0 ? null : _params$title2,
          _params$classes2 = params.classes,
          classes = _params$classes2 === void 0 ? [] : _params$classes2,
          _params$attributes2 = params.attributes,
          attributes = _params$attributes2 === void 0 ? {} : _params$attributes2,
          _params$styles2 = params.styles,
          styles = _params$styles2 === void 0 ? {} : _params$styles2;
      return apiObject({
        type: 'text',
        content: content
      }, function () {
        ensureCss();
        return makeLayersTextAbstract({
          content: content,
          transform: _objectSpread({}, meaninglessTransform, transform),
          title: title,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: ["".concat(config.familyPrefix, "-layers-text")].concat(_toConsumableArray(classes))
          }
        });
      });
    };
    var counter = function counter(content) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$title3 = params.title,
          title = _params$title3 === void 0 ? null : _params$title3,
          _params$classes3 = params.classes,
          classes = _params$classes3 === void 0 ? [] : _params$classes3,
          _params$attributes3 = params.attributes,
          attributes = _params$attributes3 === void 0 ? {} : _params$attributes3,
          _params$styles3 = params.styles,
          styles = _params$styles3 === void 0 ? {} : _params$styles3;
      return apiObject({
        type: 'counter',
        content: content
      }, function () {
        ensureCss();
        return makeLayersCounterAbstract({
          content: content.toString(),
          title: title,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: ["".concat(config.familyPrefix, "-layers-counter")].concat(_toConsumableArray(classes))
          }
        });
      });
    };
    var layer = function layer(assembler) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$classes4 = params.classes,
          classes = _params$classes4 === void 0 ? [] : _params$classes4;
      return apiObject({
        type: 'layer'
      }, function () {
        ensureCss();
        var children = [];
        assembler(function (args) {
          Array.isArray(args) ? args.map(function (a) {
            children = children.concat(a.abstract);
          }) : children = children.concat(args.abstract);
        });
        return [{
          tag: 'span',
          attributes: {
            class: ["".concat(config.familyPrefix, "-layers")].concat(_toConsumableArray(classes)).join(' ')
          },
          children: children
        }];
      });
    };
    var api = {
      noAuto: noAuto,
      config: config,
      dom: dom,
      library: library,
      parse: parse,
      findIconDefinition: findIconDefinition,
      icon: icon,
      text: text$1,
      counter: counter,
      layer: layer,
      toHtml: toHtml
    };

    var autoReplace = function autoReplace() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _params$autoReplaceSv = params.autoReplaceSvgRoot,
          autoReplaceSvgRoot = _params$autoReplaceSv === void 0 ? DOCUMENT : _params$autoReplaceSv;
      if ((Object.keys(namespace.styles).length > 0 || config.autoFetchSvg) && IS_DOM && config.autoReplaceSvg) api.dom.i2svg({
        node: autoReplaceSvgRoot
      });
    };

    var faGithub = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fab';
    var iconName = 'github';
    var width = 496;
    var height = 512;
    var ligatures = [];
    var unicode = 'f09b';
    var svgPathData = 'M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faGithub = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faArrowRight = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'arrow-right';
    var width = 448;
    var height = 512;
    var ligatures = [];
    var unicode = 'f061';
    var svgPathData = 'M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faArrowRight = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faPaperPlane = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'paper-plane';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f1d8';
    var svgPathData = 'M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faPaperPlane = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faEnvelope = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'envelope';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f0e0';
    var svgPathData = 'M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faEnvelope = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faLinkedin = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fab';
    var iconName = 'linkedin';
    var width = 448;
    var height = 512;
    var ligatures = [];
    var unicode = 'f08c';
    var svgPathData = 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faLinkedin = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faLink = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'link';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f0c1';
    var svgPathData = 'M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faLink = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faCode = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'code';
    var width = 640;
    var height = 512;
    var ligatures = [];
    var unicode = 'f121';
    var svgPathData = 'M278.9 511.5l-61-17.7c-6.4-1.8-10-8.5-8.2-14.9L346.2 8.7c1.8-6.4 8.5-10 14.9-8.2l61 17.7c6.4 1.8 10 8.5 8.2 14.9L293.8 503.3c-1.9 6.4-8.5 10.1-14.9 8.2zm-114-112.2l43.5-46.4c4.6-4.9 4.3-12.7-.8-17.2L117 256l90.6-79.7c5.1-4.5 5.5-12.3.8-17.2l-43.5-46.4c-4.5-4.8-12.1-5.1-17-.5L3.8 247.2c-5.1 4.7-5.1 12.8 0 17.5l144.1 135.1c4.9 4.6 12.5 4.4 17-.5zm327.2.6l144.1-135.1c5.1-4.7 5.1-12.8 0-17.5L492.1 112.1c-4.8-4.5-12.4-4.3-17 .5L431.6 159c-4.6 4.9-4.3 12.7.8 17.2L523 256l-90.6 79.7c-5.1 4.5-5.5 12.3-.8 17.2l43.5 46.4c4.5 4.9 12.1 5.1 17 .6z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faCode = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faPlusCircle = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'plus-circle';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f055';
    var svgPathData = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faPlusCircle = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faChevronDown = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'chevron-down';
    var width = 448;
    var height = 512;
    var ligatures = [];
    var unicode = 'f078';
    var svgPathData = 'M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faChevronDown = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faPencilAlt = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'pencil-alt';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f303';
    var svgPathData = 'M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faPencilAlt = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faAt = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'at';
    var width = 512;
    var height = 512;
    var ligatures = [];
    var unicode = 'f1fa';
    var svgPathData = 'M256 8C118.941 8 8 118.919 8 256c0 137.059 110.919 248 248 248 48.154 0 95.342-14.14 135.408-40.223 12.005-7.815 14.625-24.288 5.552-35.372l-10.177-12.433c-7.671-9.371-21.179-11.667-31.373-5.129C325.92 429.757 291.314 440 256 440c-101.458 0-184-82.542-184-184S154.542 72 256 72c100.139 0 184 57.619 184 160 0 38.786-21.093 79.742-58.17 83.693-17.349-.454-16.91-12.857-13.476-30.024l23.433-121.11C394.653 149.75 383.308 136 368.225 136h-44.981a13.518 13.518 0 0 0-13.432 11.993l-.01.092c-14.697-17.901-40.448-21.775-59.971-21.775-74.58 0-137.831 62.234-137.831 151.46 0 65.303 36.785 105.87 96 105.87 26.984 0 57.369-15.637 74.991-38.333 9.522 34.104 40.613 34.103 70.71 34.103C462.609 379.41 504 307.798 504 232 504 95.653 394.023 8 256 8zm-21.68 304.43c-22.249 0-36.07-15.623-36.07-40.771 0-44.993 30.779-72.729 58.63-72.729 22.292 0 35.601 15.241 35.601 40.77 0 45.061-33.875 72.73-58.161 72.73z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faAt = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    var faTimes = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
    var prefix = 'fas';
    var iconName = 'times';
    var width = 352;
    var height = 512;
    var ligatures = [];
    var unicode = 'f00d';
    var svgPathData = 'M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z';

    exports.definition = {
      prefix: prefix,
      iconName: iconName,
      icon: [
        width,
        height,
        ligatures,
        unicode,
        svgPathData
      ]};

    exports.faTimes = exports.definition;
    exports.prefix = prefix;
    exports.iconName = iconName;
    exports.width = width;
    exports.height = height;
    exports.ligatures = ligatures;
    exports.unicode = unicode;
    exports.svgPathData = svgPathData;
    });

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$s = "src/App.svelte";

    function create_fragment$s(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let main;
    	let nav;
    	let a0;
    	let h2;
    	let a0_href_value;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let nav_class_value;
    	let t7;
    	let home;
    	let t8;
    	let projects_1;
    	let t9;
    	let skills;
    	let t10;
    	let contact;
    	let t11;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[4]);

    	home = new Home({
    			props: { bio: /*bio*/ ctx[2] },
    			$$inline: true
    		});

    	projects_1 = new Projects({
    			props: { projects: /*projects*/ ctx[1] },
    			$$inline: true
    		});

    	skills = new Skills({
    			props: { skillsIntro: /*skillsIntro*/ ctx[3] },
    			$$inline: true
    		});

    	contact = new Contact({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav = element("nav");
    			a0 = element("a");
    			h2 = element("h2");
    			h2.textContent = "Laura Schultz";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Projects";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Skills";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Contact";
    			t7 = space();
    			create_component(home.$$.fragment);
    			t8 = space();
    			create_component(projects_1.$$.fragment);
    			t9 = space();
    			create_component(skills.$$.fragment);
    			t10 = space();
    			create_component(contact.$$.fragment);
    			t11 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h2, "class", "-mb-3 z-30 relative");
    			add_location(h2, file$s, 57, 3, 2345);
    			attr_dev(a0, "href", a0_href_value = "#home");
    			attr_dev(a0, "class", "mx-1 sm:mx-3 font-display text-base sm:text-lg relative inline-block hover:text-white");
    			add_location(a0, file$s, 53, 2, 2220);
    			attr_dev(a1, "href", "#projects");
    			attr_dev(a1, "class", "mx-1 sm:mx-2 text-sm sm:text-base hover:text-white");
    			add_location(a1, file$s, 59, 2, 2405);
    			attr_dev(a2, "href", "#skills");
    			attr_dev(a2, "class", "mx-1 sm:mx-2 text-sm sm:text-base hover:text-white");
    			add_location(a2, file$s, 63, 2, 2508);
    			attr_dev(a3, "href", "#contact");
    			attr_dev(a3, "class", "mx-1 sm:mx-2 text-sm sm:text-base hover:text-white");
    			add_location(a3, file$s, 66, 2, 2605);
    			attr_dev(nav, "class", nav_class_value = "fixed z-30 p-2 sm:px-4 md:py-4 md:px-6 text-gray-50 w-screen overflow-x-scroll whitespace-nowrap " + (/*y*/ ctx[0] > 200 ? "bg-navy-900 shadow-lg" : ""));
    			add_location(nav, file$s, 49, 1, 2054);
    			add_location(main, file$s, 48, 0, 2046);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, a0);
    			append_dev(a0, h2);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(nav, t3);
    			append_dev(nav, a2);
    			append_dev(nav, t5);
    			append_dev(nav, a3);
    			append_dev(main, t7);
    			mount_component(home, main, null);
    			append_dev(main, t8);
    			mount_component(projects_1, main, null);
    			append_dev(main, t9);
    			mount_component(skills, main, null);
    			append_dev(main, t10);
    			mount_component(contact, main, null);
    			append_dev(main, t11);
    			mount_component(footer, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[4]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (!current || dirty & /*y*/ 1 && nav_class_value !== (nav_class_value = "fixed z-30 p-2 sm:px-4 md:py-4 md:px-6 text-gray-50 w-screen overflow-x-scroll whitespace-nowrap " + (/*y*/ ctx[0] > 200 ? "bg-navy-900 shadow-lg" : ""))) {
    				attr_dev(nav, "class", nav_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			transition_in(projects_1.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			transition_out(projects_1.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(home);
    			destroy_component(projects_1);
    			destroy_component(skills);
    			destroy_component(contact);
    			destroy_component(footer);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $location;
    	validate_store(location, "location");
    	component_subscribe($$self, location, $$value => $$invalidate(5, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let pageContent = content[$location] || content.default;
    	let projects = pageContent.projects || content.default.projects;
    	let bio = pageContent.bio || content.default.bio;
    	let skillsIntro = pageContent.skillsIntro || content.default.skillsIntro;

    	// let resume = pageContent.resume || content.default.resume;
    	let y;

    	library.add(faLinkedin.faLinkedin);
    	library.add(faPaperPlane.faPaperPlane);
    	library.add(faEnvelope.faEnvelope);
    	library.add(faLink.faLink);
    	library.add(faCode.faCode);
    	library.add(faPlusCircle.faPlusCircle);
    	library.add(faGithub.faGithub);
    	library.add(faArrowRight.faArrowRight);
    	library.add(faCode.faCode);
    	library.add(faChevronDown.faChevronDown);
    	library.add(faPencilAlt.faPencilAlt);
    	library.add(faAt.faAt);
    	library.add(faTimes.faTimes);
    	dom.watch();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, y = window.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		Home,
    		Projects,
    		Skills,
    		Contact,
    		Footer,
    		location,
    		content,
    		library,
    		dom,
    		faGithub: faGithub.faGithub,
    		faArrowRight: faArrowRight.faArrowRight,
    		faPaperPlane: faPaperPlane.faPaperPlane,
    		faEnvelope: faEnvelope.faEnvelope,
    		faLinkedin: faLinkedin.faLinkedin,
    		faLink: faLink.faLink,
    		faCode: faCode.faCode,
    		faPlusCircle: faPlusCircle.faPlusCircle,
    		faChevronDown: faChevronDown.faChevronDown,
    		faPencilAlt: faPencilAlt.faPencilAlt,
    		faAt: faAt.faAt,
    		faTimes: faTimes.faTimes,
    		pageContent,
    		projects,
    		bio,
    		skillsIntro,
    		y,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ("pageContent" in $$props) pageContent = $$props.pageContent;
    		if ("projects" in $$props) $$invalidate(1, projects = $$props.projects);
    		if ("bio" in $$props) $$invalidate(2, bio = $$props.bio);
    		if ("skillsIntro" in $$props) $$invalidate(3, skillsIntro = $$props.skillsIntro);
    		if ("y" in $$props) $$invalidate(0, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [y, projects, bio, skillsIntro, onwindowscroll];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

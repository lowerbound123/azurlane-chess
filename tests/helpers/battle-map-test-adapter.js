import {defineComponent, h} from 'vue';

// HappyDOM has no WebGL. This explicit test-only adapter verifies the filtered
// model and semantic UI events; canvas rendering/picking belongs to browser QA.
export const BattleMap3D = defineComponent({
  name: 'BattleMapTestAdapter',
  props: {model: {type: Object, required: true}},
  emits: ['zoom', 'rotate', 'hex', 'ship', 'node', 'hover', 'home'],
  setup(props, {emit, expose}) {
    expose({reset() {}, focus() {}, zoomBy() {}, toggleRotate() {}});
    return () => {
      const model = props.model;
      return h('section', {'data-testid': 'semantic-map-adapter'}, [
        h('button', {type: 'button', 'data-map-error-exit': '', onClick: () => emit('home')}, '模拟渲染故障返回菜单'),
        h('div', {'data-map-cells': ''}, model.cells.map(cell => h('button', {
          key: cell.k,
          type: 'button',
          'data-map-cell': cell.k,
          'data-known': String(cell.known),
          'data-visible': String(cell.visible),
          'data-island': String(cell.island),
          'data-overlay': cell.overlay || '',
          'data-tutorial': String(cell.tutorial),
          onClick: event => emit('hex', {hex: cell, event, forceMove: false}),
          onContextmenu: event => {event.preventDefault(); emit('hex', {hex: cell, event, forceMove: true});},
          onMouseenter: () => emit('hover', cell),
        }, `cell ${cell.k}`))),
        h('div', {'data-map-ships': ''}, model.ships.map(ship => h('button', {
          key: ship.id, type: 'button', 'data-map-ship': ship.id,
          onClick: event => emit('ship', {ship, event}),
        }, ship.label))),
        h('ul', {'data-map-mines': ''}, model.mines.map((mine, index) => h('li', {
          key: index, 'data-map-mine': `${mine.q},${mine.r}`,
        }, 'public mine'))),
        model.phase === 'plan' && model.showPlans ? h('ul', {'data-map-plans': ''}, model.previews.map(preview => h('li', {
          key: preview.ship.id, 'data-map-plan': preview.ship.id,
        }, preview.nodes.slice(1).map((node, index) => h('button', {
          type: 'button', 'data-map-node': index + 1,
          'data-editable': String(preview.selected && model.mode === 'move'),
          onClick: event => preview.selected && model.mode === 'move'
            ? emit('node', {index: index + 1, shipId: preview.ship.id})
            : emit('hex', {hex: node.pos, event, forceMove: false}),
        }, `node ${index + 1}`))))) : null,
      ]);
    };
  },
});

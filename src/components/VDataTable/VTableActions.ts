import { VNode, CreateElement, VNodeChildrenArrayContents } from 'vue'
import { injectOne } from '../../util/inject'
import { DataIteratorProvide } from '../VDataIterator/VDataIterator'

// import VRow from './VRow'
import VBtn from '../VBtn'
import VIcon from '../VIcon'
import VSelect from '../VSelect'
import { PropValidator } from 'vue/types/options';

export default injectOne<DataIteratorProvide>()('dataIterator').extend({
  name: 'v-table-actions',

  inheritAttrs: false,

  props: {
    prevIcon: {
      type: String,
      default: '$vuetify.icons.prev'
    },
    nextIcon: {
      type: String,
      default: '$vuetify.icons.next'
    },
    firstIcon: {
      type: String,
      default: '$vuetify.icons.first'
    },
    lastIcon: {
      type: String,
      default: '$vuetify.icons.last'
    },
    rowsPerPageItems: {
      type: Array,
      default: () => ([
        { text: '5', value: 5 },
        { text: '10', value: 10 },
        { text: '15', value: 15 },
        { text: 'All', value: -1 }
      ])
    } as PropValidator<{ text: string, value: number }[]>,
    rowsPerPageText: {
      type: String,
      default: 'Rows per page:'
    },
    showFirstLastPage: {
      type: Boolean
    }
  },

  methods: {
    genRowsPerPageSelect (h: CreateElement): VNode {
      return h('div', {
        staticClass: 'v-data-table__actions__select'
      }, [
        this.rowsPerPageText,
        h(VSelect, {
          attrs: {
            'aria-label': this.rowsPerPageText
          },
          props: {
            items: this.rowsPerPageItems,
            value: this.dataIterator.rowsPerPage,
            hideDetails: true,
            auto: true,
            minWidth: '75px'
          },
          on: {
            input: (val: any) => {
              this.dataIterator.page = 1
              this.dataIterator.rowsPerPage = val
            }
          }
        })
      ])
    },

    genPagination (h: CreateElement): VNode {
      let children: VNodeChildrenArrayContents = ['–']

      if (this.dataIterator.itemsLength) {
        const stop = this.dataIterator.itemsLength < this.dataIterator.pageStop || this.dataIterator.pageStop < 0
          ? this.dataIterator.itemsLength
          : this.dataIterator.pageStop

          children = this.$scopedSlots.pageText
          ? [this.$scopedSlots.pageText({
            pageStart: this.dataIterator.pageStart + 1,
            pageStop: stop,
            itemsLength: this.dataIterator.itemsLength
          })]
          : [`${this.dataIterator.pageStart + 1}-${stop} of ${this.dataIterator.itemsLength}`]
      }

      return h('div', {
        'class': 'v-data-table__actions__pagination'
      }, children)
    },

    genIcon (h: CreateElement, click: Function, disabled: boolean, label: string, icon: string): VNode {
      return h(VBtn, {
        props: {
          disabled,
          icon: true,
          flat: true,
          // dark: this.dark, // TODO: add mixin
          // light: this.light // TODO: add mixin
        },
        on: {
          click
        },
        attrs: {
          'aria-label': label // TODO: Localization
        }
      }, [h(VIcon, icon)])
    },

    genIcons (h: CreateElement): VNodeChildrenArrayContents {
      const icons: VNodeChildrenArrayContents = []

      icons.push(this.genIcon(h, () => {
        this.dataIterator.page = this.dataIterator.page - 1
      }, this.dataIterator.page === 1, 'Previous page', this.prevIcon))

      icons.push(this.genIcon(h, () => {
        this.dataIterator.page = this.dataIterator.page + 1
      }, this.dataIterator.rowsPerPage < 0 || this.dataIterator.page * this.dataIterator.rowsPerPage >= this.dataIterator.itemsLength || this.dataIterator.pageStop < 0, 'Next page', this.nextIcon))

      if (this.showFirstLastPage) {
        icons.unshift(this.genIcon(h, () => {
          this.dataIterator.page = 1
        }, this.dataIterator.page === 1, 'First page', this.firstIcon))

        icons.push(this.genIcon(h, () => {
          this.dataIterator.page = this.dataIterator.pageCount
        }, this.dataIterator.page === this.dataIterator.pageCount || this.dataIterator.rowsPerPage === -1, 'Last page', this.lastIcon))
      }

      return icons
    }
  },

  render (h: CreateElement): VNode {
    return h('div', {
      staticClass: 'v-data-table__actions'
    }, [
      this.genRowsPerPageSelect(h),
      this.genPagination(h),
      this.genIcons(h)
    ])
  }
})

import type { App } from 'vue';
import { Button } from './Button';
import VXETable from 'vxe-table';
import {Icon} from './Icon/index';

import {
  Affix, Anchor, AutoComplete, Alert,
  Avatar, BackTop, Badge, Breadcrumb,
  Button as AntButton,
  Calendar, Card, Collapse,
  Carousel, Cascader, Checkbox, Col, Comment,
  ConfigProvider, DatePicker, Descriptions, Divider,
  Dropdown, Drawer, Empty, Form,Input, Image,
  InputNumber, Layout, List, message, Menu, Mentions,
  Modal, Statistic, notification, PageHeader, Pagination,
  Popconfirm, Popover, Progress, Radio, Rate, Result, Row,
  Select, Skeleton, Slider, Space, Spin, Steps, Switch, Table,
  Transfer, Tree, TreeSelect, Tabs, Tag, TimePicker, Timeline,
  Tooltip, Upload, LocaleProvider,Grid,QRCode,Flex,Segmented,Watermark
} from 'ant-design-vue';

const antDesignCompList = [
  Affix, Anchor, AutoComplete, Alert,
  Avatar, BackTop, Badge, Breadcrumb,
  Calendar, Card, Collapse,
  Carousel, Cascader, Checkbox, Col, Comment,
  ConfigProvider, DatePicker, Descriptions, Divider,
  Dropdown, Drawer, Empty, Form, Input, Image,
  InputNumber, Layout, List, message, Menu, Mentions,
  Modal, Statistic, notification, PageHeader, Pagination,
  Popconfirm, Popover, Progress, Radio, Rate, Result, Row,
  Select, Skeleton, Slider, Space, Spin, Steps, Switch, Table,
  Transfer, Tree, TreeSelect, Tabs, Tag, TimePicker, Timeline,
  Tooltip, Upload, LocaleProvider,VXETable,Grid,QRCode,Flex,Segmented,Watermark
];

const compList = [AntButton.Group,Icon];

export function registerGlobComp(app: App) {
  compList.forEach((comp) => {
    app.component(comp.name || comp.displayName, comp);
  });
  antDesignCompList.forEach(com => {
    app.use(com)
  })
  app.use(Button);
}

<script setup>
import { ref } from 'vue'
import MainLayout from '../components/layouts/MainLayout.vue' 
import BaseButton from '../components/base/BaseButton.vue'
import BaseTable from '../components/base/BaseTable.vue'

const stats = ref([
  { label: 'Total Warehouse', value: '12', trend: '+2', trendColor: 'text-green-500', icon: 'fa-house-chimney', iconColor: 'text-blue-600', bgIcon: 'bg-blue-50' },
  { label: 'Total Storage Bin', value: '1,250', trend: '4.3%', trendColor: 'text-green-500', icon: 'fa-box-archive', iconColor: 'text-blue-600', bgIcon: 'bg-blue-50' },
  { label: 'Total Asset', value: '25,430', trend: 'Steady', trendColor: 'text-slate-400', icon: 'fa-dolly', iconColor: 'text-orange-500', bgIcon: 'bg-orange-50' },
  { label: 'Stock Availability', value: '98.5%', trend: '0.5%', trendColor: 'text-red-500', icon: 'fa-circle-check', iconColor: 'text-green-500', bgIcon: 'bg-green-50' },
])

const barSeries = ref([
  { name: 'Inbound Asset', data: [35, 45, 30, 75, 50, 40, 25] },
  { name: 'Outbound Asset', data: [20, 25, 20, 35, 25, 20, 15] }
])

const barOptions = ref({
  chart: { type: 'bar', stacked: true, toolbar: { show: false } },
  colors: ['#2563EB', '#BFDBFE'],
  plotOptions: { bar: { columnWidth: '35%', borderRadius: 4 } },
  dataLabels: { enabled: false },
  xaxis: { 
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisBorder: { show: false },
    labels: { style: { colors: '#94a3b8' } }
  },
  yaxis: {
    min: 0,
    max: 120,
    tickAmount: 6,
    labels: { style: { colors: '#94a3b8' } }
  },
  grid: { borderColor: '#f1f5f9' },
  legend: { position: 'bottom', horizontalAlign: 'left', markers: { radius: 12 } }
})

const donutSeries = ref([560, 438, 252])
const donutOptions = ref({
  labels: ['Small Asset', 'Medium Asset', 'Large Asset'],
  colors: ['#2563EB', '#10B981', '#F59E0B'],
  dataLabels: { 
    enabled: true,
    style: {
      fontSize: '10px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      colors: ['#fff']
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '55%',
        labels: {
          show: true,
          total: { show: true, label: 'Total Bin', formatter: () => '1.250', fontSize: '12px', color: '#64748b' },
          value: { show: true, fontSize: '20px', fontWeight: 'bold' }
        },
      }
    }
  },
  legend: { show: false }
})

// --- DATA TABEL ---
const whHeaders = ['Warehouse', 'Location', 'Stroge Bin', 'Status']
const whData = ref([
  { warehouse: 'WH_01', location: 'Gudang Jogja', storage: 'Sleman', status: 'Active' },
  { warehouse: 'WH_02', location: 'Gudang Bandung', storage: 'Cimahi', status: 'Active' },
  { warehouse: 'WH_03', location: 'Gudang Jakarta', storage: 'Cakung', status: 'Active' },
])

const lowStockHeaders = ['Asset', 'Kategori', 'Stock', 'Minimum']
const lowStockData = ref([
  { asset: 'Nike Air', kategori: 'Small Asset', stock: '3', minimum: '10' },
  { asset: 'Cannon', kategori: 'Medium Asset', stock: '3', minimum: '10' },
  { asset: 'Samba', kategori: 'Large Asset', stock: '3', minimum: '5' },
])
</script>

<template>
  <MainLayout>
    <div class="space-y-8">
      
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dashboard Warehouse</h1>
          <p class="text-slate-500 text-sm">Monitor aktivitas warehouse dan inventory secara real-time.</p>
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
          <BaseButton class="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 font-medium text-sm flex-1 sm:flex-none">
            <i class="fas fa-plus-circle"></i> Add Asset
          </BaseButton>
          <BaseButton class="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm font-medium text-sm flex-1 sm:flex-none">
            <i class="fas fa-file-export text-slate-400"></i> Export Data
          </BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="item in stats" :key="item.label" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', item.bgIcon]">
              <i :class="['fas', item.icon, item.iconColor]"></i>
            </div>
            <span :class="['text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-50 border border-slate-100', item.trendColor]">
              {{ item.trend }}
            </span>
          </div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.label }}</p>
          <h3 class="text-2xl font-bold text-slate-800 mt-1">{{ item.value }}</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-slate-800 text-sm md:text-base">Inbound / Outbound Asset Chart</h3>
            <div class="flex bg-slate-50 p-1 rounded-lg">
              <button class="px-4 py-1 text-xs font-bold bg-white text-blue-600 rounded-md shadow-sm">Weekly</button>
              <button class="px-4 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition">Monthly</button>
            </div>
          </div>
          <apexchart type="bar" height="300" :options="barOptions" :series="barSeries"></apexchart>
        </div>

        <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 class="font-bold text-slate-800 mb-8 text-sm md:text-base">Asset Distribution</h3>
          <div class="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between flex-1 gap-6">
            <apexchart type="donut" width="200" :options="donutOptions" :series="donutSeries"></apexchart>
            
            <div class="flex-1 space-y-5 w-full sm:pl-6 lg:pl-0 xl:pl-6">
              <div v-for="(val, i) in [560, 438, 252]" :key="i" class="flex justify-between items-start">
                <div class="flex items-center gap-2">
                  <div :class="['w-3 h-3 rounded-full mt-1 flex-shrink-0', i===0?'bg-blue-600':i===1?'bg-emerald-500':'bg-orange-500']"></div>
                  <div>
                    <p class="text-xs font-bold text-slate-800 leading-none">{{ donutOptions.labels[i] }}</p>
                    <p class="text-[9px] text-slate-400 mt-1">{{ i===0?'45%':i===1?'35%':'20%' }} dari total</p>
                  </div>
                </div>
                <div class="text-right ml-2">
                  <span class="text-xs font-bold text-slate-800">{{ val }}</span>
                  <p class="text-[9px] text-slate-400 uppercase font-semibold">Bin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div v-for="title in ['Recent Warehouse', 'Recent Warehouse', 'Low Stock Alert']" :key="title" class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-800 text-sm">{{ title }}</h3>
            <button class="text-blue-600 text-[10px] font-bold hover:underline">Lihat semua</button>
          </div>
          <BaseTable 
            :headers="title.includes('Alert') ? lowStockHeaders : whHeaders" 
            :items="title.includes('Alert') ? lowStockData : whData" 
          />
        </div>
      </div>

    </div>
  </MainLayout>
</template>
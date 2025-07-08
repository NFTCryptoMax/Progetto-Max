import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Live Countdown Panel Component
const LiveCountdownPanel = ({ tenders }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [notifiedTenders, setNotifiedTenders] = useState(new Set());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Find the next upcoming tender expiration
  const getNextExpiringTender = () => {
    const now = currentTime;
    const futureTenders = tenders
      .filter(tender => new Date(tender.due_date) > now)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    
    return futureTenders.length > 0 ? futureTenders[0] : null;
  };

  const nextTender = getNextExpiringTender();

  // Calculate countdown
  const getCountdown = (dueDate) => {
    const diff = new Date(dueDate) - currentTime;
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, total: diff };
  };

  // Get color based on time remaining
  const getTimeColor = (totalMs) => {
    const hours = totalMs / (1000 * 60 * 60);
    if (hours < 1) return 'text-red-500 border-red-500 bg-red-50';
    if (hours < 4) return 'text-orange-500 border-orange-500 bg-orange-50';
    return 'text-green-500 border-green-500 bg-green-50';
  };

  // Show notification when countdown reaches 0
  useEffect(() => {
    if (nextTender && reminderEnabled) {
      const countdown = getCountdown(nextTender.due_date);
      if (countdown.total <= 0 && !notifiedTenders.has(nextTender.id)) {
        alert(`⏰ TENDER EXPIRED: ${nextTender.tender_name} for ${nextTender.customer}`);
        setNotifiedTenders(prev => new Set([...prev, nextTender.id]));
      }
    }
  }, [currentTime, nextTender, reminderEnabled, notifiedTenders]);

  if (!nextTender) {
    return (
      <div className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg z-40 min-w-80">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400">⏰</span>
          <h3 className="text-sm font-semibold text-gray-300">Next Tender Due</h3>
        </div>
        <div className="text-center text-gray-500 text-sm">
          No upcoming tenders
        </div>
      </div>
    );
  }

  const countdown = getCountdown(nextTender.due_date);
  const colorClass = getTimeColor(countdown.total);

  return (
    <div className={`fixed top-4 right-4 bg-gray-800 border-2 rounded-lg p-4 shadow-lg z-40 min-w-80 ${colorClass.replace('text-', 'border-').replace('bg-', '').replace('text-', '')} border-opacity-50`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {countdown.total < 3600000 ? '🔴' : countdown.total < 14400000 ? '🟠' : '🟢'}
          </span>
          <h3 className="text-sm font-semibold text-gray-100">Next Tender Due</h3>
        </div>
        <button
          onClick={() => setReminderEnabled(!reminderEnabled)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            reminderEnabled 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
          title={reminderEnabled ? 'Disable reminders' : 'Enable reminders'}
        >
          🔔 {reminderEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-sm font-medium text-gray-100 truncate">
            {nextTender.tender_name}
          </div>
          <div className="text-xs text-gray-400">
            {nextTender.customer}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-300">
            Due: {new Date(nextTender.due_date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </div>

        <div className="text-center font-mono text-lg font-bold text-white bg-gray-900 border border-gray-600 rounded px-3 py-2 shadow-inner">
          {countdown.hours.toString().padStart(2, '0')}h{' '}
          {countdown.minutes.toString().padStart(2, '0')}m{' '}
          {countdown.seconds.toString().padStart(2, '0')}s
        </div>

        <div className="text-xs text-center text-gray-400">
          remaining
        </div>
      </div>
    </div>
  );
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STATUSES = ['Offer', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'BAFO', 'Contract Signed', 'Won', 'Lost'];
const PRIORITIES = ['High', 'Medium', 'Low'];

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Round 1': return 'bg-blue-100 text-blue-800';
      case 'Round 2': return 'bg-indigo-100 text-indigo-800';
      case 'Round 3': return 'bg-purple-100 text-purple-800';
      case 'Round 4': return 'bg-pink-100 text-pink-800';
      case 'BAFO': return 'bg-orange-100 text-orange-800';
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );
};

const GanttChart = ({ tenders, isPrintMode = false }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showToday, setShowToday] = useState(true);
  const [hoverDate, setHoverDate] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const timelineRef = useRef(null);
  const barsRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Auto-scroll to today on component mount
  React.useEffect(() => {
    if (!isInitialized && barsRef.current && tenders.length > 0) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        goToToday();
        setIsInitialized(true);
      }, 100);
    }
  }, [tenders.length, isInitialized]);
  
  if (!tenders.length) return null;

  // Calculate date range
  const allDates = tenders.flatMap(tender => [
    new Date(tender.start_date),
    new Date(tender.expiry_date)
  ]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const today = new Date();

  // Add buffer to date range
  const bufferDays = 2;
  minDate.setDate(minDate.getDate() - bufferDays);
  maxDate.setDate(maxDate.getDate() + bufferDays);

  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  const todayPosition = ((today - minDate) / (maxDate - minDate)) * 100;

  // Calculate zoom-adjusted width
  const baseWidth = Math.max(800, totalDays * 30);
  const zoomedWidth = baseWidth * zoomLevel;

  const getBarColor = (status) => {
    switch (status) {
      case 'Offer': return 'from-blue-400 to-blue-600';
      case 'Round 1': return 'from-gray-400 to-gray-400';
      case 'Round 2': return 'from-gray-400 to-gray-400';
      case 'Round 3': return 'from-gray-400 to-gray-400';
      case 'Round 4': return 'from-gray-400 to-gray-400';
      case 'BAFO': return 'from-purple-400 to-purple-600';
      case 'Contract Signed': return 'from-yellow-300 to-yellow-500';
      case 'Won': return 'from-green-400 to-green-600';
      case 'Lost': return 'from-red-500 to-red-700';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Get status flag
  const getStatusFlag = (status) => {
    switch (status) {
      case 'Won':
        return '🟢';
      case 'Lost':
        return '🔴';
      case 'Contract Signed':
        return '🟡';
      default:
        return null;
    }
  };

  // Zoom controls
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5)); // Max zoom 5x
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.3)); // Min zoom 0.3x
  };

  // Toggle today line visibility
  const toggleToday = () => {
    setShowToday(prev => !prev);
  };

  // Go to today function - Scroll both timeline and bars containers
  const goToToday = () => {
    const scrollLeft = (todayPosition / 100) * zoomedWidth - (window.innerWidth / 4);
    const scrollPosition = Math.max(0, scrollLeft);
    
    if (timelineRef.current) {
      timelineRef.current.scrollTo({
        left: scrollPosition,
        behavior: isInitialized ? 'smooth' : 'auto'
      });
    }
    if (barsRef.current) {
      barsRef.current.scrollTo({
        left: scrollPosition,
        behavior: isInitialized ? 'smooth' : 'auto'
      });
    }
  };

  // Handle timeline hover - Work with either container
  const handleTimelineMouseMove = (e) => {
    const container = barsRef.current || timelineRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const percentage = (x / zoomedWidth) * 100;
      const hoveredDate = new Date(minDate.getTime() + (percentage / 100) * (maxDate - minDate));
      
      setHoverDate(hoveredDate);
      setHoverPosition(percentage);
    }
  };

  const handleTimelineMouseLeave = () => {
    setHoverDate(null);
    setHoverPosition(0);
  };

  // Generate every single day timeline
  const generateCompleteTimeline = () => {
    const markers = [];
    const current = new Date(minDate);
    let lastMonth = '';
    
    while (current <= maxDate) {
      const position = ((current - minDate) / (maxDate - minDate)) * 100;
      const currentMonth = current.toLocaleDateString('en-US', { month: 'short' });
      const isNewMonth = currentMonth !== lastMonth;
      
      markers.push({
        date: new Date(current),
        position,
        dayLabel: current.getDate(),
        monthLabel: currentMonth,
        isNewMonth,
        fullDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
      
      lastMonth = currentMonth;
      current.setDate(current.getDate() + 1);
    }
    
    return markers;
  };

  const timelineMarkers = generateCompleteTimeline();

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 ${isPrintMode ? 'print-gantt' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-100">Project Timeline - GANTT Chart</h3>
        
        {/* Enhanced Controls - Top Right */}
        <div className="flex gap-2">
          {/* Show/Hide Today Toggle */}
          <button
            onClick={toggleToday}
            className={`px-3 py-1 text-xs rounded border transition-colors duration-200 ${
              showToday 
                ? 'bg-red-600 text-white border-red-500 hover:bg-red-700' 
                : 'bg-gray-600 text-gray-300 border-gray-500 hover:bg-gray-500'
            }`}
            title="Toggle Today Line"
          >
            {showToday ? 'Hide Today' : 'Show Today'}
          </button>

          {/* Go to Today Button */}
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded border border-blue-500 hover:bg-blue-700 transition-colors duration-200"
            title="Center on Today"
          >
            Go to Today
          </button>

          {/* Zoom Controls */}
          <div className="flex gap-2 bg-gray-700 rounded-lg p-2 border border-gray-600 shadow-lg">
            <button
              onClick={zoomOut}
              className="w-8 h-8 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded flex items-center justify-center transition-colors duration-200"
              title="Zoom Out"
              disabled={zoomLevel <= 0.3}
            >
              <span className="text-lg font-bold">-</span>
            </button>
            
            <div className="flex items-center px-2 text-xs text-gray-300 min-w-12 justify-center">
              {Math.round(zoomLevel * 100)}%
            </div>
            
            <button
              onClick={zoomIn}
              className="w-8 h-8 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded flex items-center justify-center transition-colors duration-200"
              title="Zoom In"
              disabled={zoomLevel >= 5}
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* GANTT Chart with Fixed Left Column */}
      <div className="flex border border-gray-600 rounded-lg overflow-hidden">
        {/* Fixed Left Column - Row Labels */}
        <div className="w-80 bg-gray-750 border-r border-gray-600 flex-shrink-0 z-10">
          {/* Header for left column */}
          <div className="h-20 bg-gray-700 border-b border-gray-600 p-3 flex items-center">
            <span className="text-sm font-semibold text-gray-200">Project Details</span>
          </div>
          
          {/* Row labels */}
          <div className="space-y-4 p-3" style={{ height: `${tenders.length * 64 + 24}px` }}>
            {tenders.map((tender) => {
              const statusFlag = getStatusFlag(tender.status);
              
              return (
                <div key={tender.id} className="h-12 flex items-center text-sm">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-gray-100 truncate">
                        {tender.item} - {tender.tender_name}
                      </div>
                      {statusFlag && (
                        <span className="text-lg flex-shrink-0">
                          {statusFlag}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {tender.customer} - Due: {new Date(tender.expiry_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}, {new Date(tender.due_date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Timeline and Bars Area */}
        <div className="flex-1 relative min-w-0">
          {/* Timeline Header */}
          <div className="h-20 bg-gray-700 border-b border-gray-600 relative">
            <div 
              ref={timelineRef}
              className="h-full overflow-x-auto overflow-y-hidden timeline-header-scroll"
              onScroll={(e) => {
                // Sync scroll with bars area
                if (barsRef.current && e.target.scrollLeft !== barsRef.current.scrollLeft) {
                  barsRef.current.scrollLeft = e.target.scrollLeft;
                }
              }}
            >
              <div 
                className="relative" 
                style={{ width: `${zoomedWidth}px`, height: '100%' }}
                onMouseMove={handleTimelineMouseMove}
                onMouseLeave={handleTimelineMouseLeave}
              >
                {/* Month headers */}
                <div className="h-8 relative mb-2 mt-2">
                  {timelineMarkers
                    .filter(marker => marker.isNewMonth)
                    .map((marker, index) => {
                      const nextMonthIndex = timelineMarkers.findIndex((m, i) => 
                        i > timelineMarkers.indexOf(marker) && m.isNewMonth
                      );
                      const endPosition = nextMonthIndex !== -1 
                        ? timelineMarkers[nextMonthIndex].position 
                        : 100;
                      const width = endPosition - marker.position;
                      
                      return (
                        <div
                          key={`month-${index}`}
                          className="absolute top-0 h-full bg-gray-600 border border-gray-500 rounded flex items-center justify-center"
                          style={{
                            left: `${marker.position}%`,
                            width: `${width}%`
                          }}
                        >
                          <span className="text-sm font-bold text-gray-200">
                            {marker.monthLabel}
                          </span>
                        </div>
                      );
                    })}
                </div>
                
                {/* Daily timeline */}
                <div className="h-12 bg-gray-600 rounded relative">
                  {/* Today indicator */}
                  {showToday && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 today-line"
                      style={{ left: `${todayPosition}%` }}
                    >
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                      <div className="absolute top-14 -left-8 text-xs text-red-400 font-bold whitespace-nowrap bg-gray-800 px-3 py-1 rounded-full border border-red-400 shadow-lg z-50">
                        TODAY
                      </div>
                    </div>
                  )}

                  {/* Date hover overlay */}
                  {hoverDate && (
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-blue-400 opacity-50 z-40 pointer-events-none"
                      style={{ left: `${hoverPosition}%` }}
                    >
                      {/* Hover date tooltip */}
                      <div className="absolute top-14 -left-12 text-xs text-blue-400 font-medium whitespace-nowrap bg-gray-800 px-2 py-1 rounded border border-blue-400 shadow-lg z-50">
                        {hoverDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Day markers */}
                  {timelineMarkers.map((marker, index) => (
                    <div 
                      key={index} 
                      className="absolute top-0 bottom-0"
                      style={{ left: `${marker.position}%` }}
                    >
                      <div className="w-px h-full bg-gray-500 opacity-60"></div>
                      <div className="absolute top-1 -left-2 text-xs text-gray-300 font-medium">
                        {marker.dayLabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GANTT Bars Area with visible scrollbar */}
          <div 
            ref={barsRef}
            className="relative overflow-x-auto overflow-y-hidden gantt-bars-container"
            style={{ 
              height: `${tenders.length * 64 + 24}px`
            }}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={handleTimelineMouseLeave}
            onScroll={(e) => {
              // Sync scroll with timeline header
              if (timelineRef.current && e.target.scrollLeft !== timelineRef.current.scrollLeft) {
                timelineRef.current.scrollLeft = e.target.scrollLeft;
              }
            }}
          >
            <div className="relative" style={{ width: `${zoomedWidth}px`, height: '100%' }}>
              {/* Extended Today Line */}
              {showToday && (
                <div 
                  className="absolute top-0 w-0.5 bg-red-500 opacity-60 z-30 pointer-events-none"
                  style={{ 
                    left: `${todayPosition}%`,
                    height: '100%'
                  }}
                ></div>
              )}

              {/* Extended Date Hover Overlay */}
              {hoverDate && (
                <div 
                  className="absolute top-0 w-px bg-blue-400 opacity-30 z-20 pointer-events-none"
                  style={{ 
                    left: `${hoverPosition}%`,
                    height: '100%'
                  }}
                ></div>
              )}

              {/* GANTT Bars */}
              <div className="space-y-4 p-3">
                {tenders.map((tender) => {
                  const startDate = new Date(tender.start_date);
                  const endDate = new Date(tender.expiry_date);
                  const startPos = ((startDate - minDate) / (maxDate - minDate)) * 100;
                  const width = ((endDate - startDate) / (maxDate - minDate)) * 100;

                  return (
                    <div key={tender.id} className="h-12 relative">
                      <div className="h-full bg-gray-600 rounded-lg border border-gray-500 relative">
                        <div
                          className={`absolute top-1 bottom-1 rounded-lg bg-gradient-to-r ${getBarColor(tender.status)} shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105`}
                          style={{
                            left: `${startPos}%`,
                            width: `${width}%`,
                            minWidth: `${Math.max(80, 80 * zoomLevel)}px`
                          }}
                          title={`${tender.item} - ${tender.tender_name} | ${tender.status}`}
                        >
                          <div className="h-full flex items-center justify-center px-2">
                            <span className="text-white font-medium text-sm bg-black bg-opacity-30 px-2 py-1 rounded backdrop-blur-sm text-center">
                              {tender.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sales Funnel Chart Component
const SalesFunnelChart = ({ tenders }) => {
  const statusOrder = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'BAFO', 'Won', 'Lost'];
  const statusCounts = statusOrder.map(status => ({
    status,
    count: tenders.filter(tender => tender.status === status).length,
    value: tenders.filter(tender => tender.status === status)
      .reduce((sum, tender) => sum + tender.deal_value, 0)
  }));

  const COLORS = {
    'Round 1': '#3B82F6',
    'Round 2': '#6366F1',
    'Round 3': '#8B5CF6',
    'Round 4': '#EC4899',
    'BAFO': '#F59E0B',
    'Won': '#10B981',
    'Lost': '#EF4444'
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Sales Pipeline Funnel</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={statusCounts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} stroke="#E5E7EB" />
            <YAxis stroke="#E5E7EB" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'count' ? `${value} offers` : `$${value.toLocaleString()}`,
                name === 'count' ? 'Number of Offers' : 'Total Value'
              ]}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #4B5563',
                borderRadius: '8px',
                color: '#E5E7EB'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
              name="count"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Deal Values by Customer Pie Chart
const CustomerDealsPieChart = ({ tenders }) => {
  const customerData = tenders.reduce((acc, tender) => {
    if (!acc[tender.customer]) {
      acc[tender.customer] = { name: tender.customer, value: 0, count: 0 };
    }
    acc[tender.customer].value += tender.deal_value;
    acc[tender.customer].count += 1;
    return acc;
  }, {});

  const pieData = Object.values(customerData);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  // Custom label function for better readability
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is significant enough
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
        stroke="#000"
        strokeWidth="0.5"
        paintOrder="stroke"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Deal Values by Customer</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`$${value.toLocaleString()}`, 'Deal Value']}
              labelFormatter={(label) => `Customer: ${label}`}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #4B5563',
                borderRadius: '8px',
                color: '#E5E7EB'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="square"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: '#E5E7EB'
              }}
              formatter={(value, entry) => `${value} ($${entry.payload.value.toLocaleString()})`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Priority Distribution Bar Chart
const PriorityBarChart = ({ tenders }) => {
  const priorityData = ['High', 'Medium', 'Low'].map(priority => ({
    priority,
    count: tenders.filter(tender => tender.priority === priority).length,
    totalValue: tenders.filter(tender => tender.priority === priority)
      .reduce((sum, tender) => sum + tender.deal_value, 0)
  }));

  const COLORS = {
    'High': '#EF4444',
    'Medium': '#F59E0B',
    'Low': '#10B981'
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">Tenders by Priority Level</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="priority" stroke="#E5E7EB" />
            <YAxis yAxisId="left" stroke="#E5E7EB" />
            <YAxis yAxisId="right" orientation="right" stroke="#E5E7EB" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'count' ? `${value} offers` : `$${value.toLocaleString()}`,
                name === 'count' ? 'Number of Offers' : 'Total Value'
              ]}
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #4B5563',
                borderRadius: '8px',
                color: '#E5E7EB'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="count" />
            <Bar yAxisId="right" dataKey="totalValue" fill="#82ca9d" name="totalValue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TenderForm = ({ tender, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    item: tender?.item || '',
    customer: tender?.customer || '',
    tender_name: tender?.tender_name || '',
    status: tender?.status || 'Offer',
    start_date: tender?.start_date || '',
    expiry_date: tender?.expiry_date || '',
    due_date: tender?.due_date ? new Date(tender.due_date).toTimeString().slice(0, 5) : '',
    deal_value: tender?.deal_value || '',
    priority: tender?.priority || 'Medium',
    assigned_sales_rep: tender?.assigned_sales_rep || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert time to today's date with the specified time
    const submissionData = {
      ...formData,
      due_date: formData.due_date ? 
        new Date(`${new Date().toISOString().split('T')[0]}T${formData.due_date}:00`).toISOString() : 
        new Date().toISOString()
    };
    onSave(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">
          {tender ? 'Edit Tender' : 'New Tender'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">ID</label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) => setFormData({...formData, item: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">BID Name</label>
            <input
              type="text"
              value={formData.tender_name}
              onChange={(e) => setFormData({...formData, tender_name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Customer</label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({...formData, customer: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
            <input
              type="time"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deal Value ($)</label>
            <input
              type="number"
              value={formData.deal_value}
              onChange={(e) => setFormData({...formData, deal_value: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Assigned Sales Rep</label>
            <input
              type="text"
              value={formData.assigned_sales_rep}
              onChange={(e) => setFormData({...formData, assigned_sales_rep: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-gray-100 py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    customer: ''
  });
  const [customers, setCustomers] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Refs for PDF export
  const ganttRef = useRef(null);
  const chartsRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    fetchTenders();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterTenders();
  }, [tenders, filters]);

  const fetchTenders = async () => {
    try {
      const response = await axios.get(`${API}/tenders`);
      setTenders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tenders:', error);
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/tenders/filters/customers`);
      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filterTenders = () => {
    let filtered = tenders;
    
    if (filters.status) {
      filtered = filtered.filter(tender => tender.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(tender => tender.priority === filters.priority);
    }
    if (filters.customer) {
      filtered = filtered.filter(tender => tender.customer === filters.customer);
    }
    
    setFilteredTenders(filtered);
  };

  const handleSaveTender = async (formData) => {
    try {
      if (editingTender) {
        await axios.put(`${API}/tenders/${editingTender.id}`, formData);
      } else {
        await axios.post(`${API}/tenders`, formData);
      }
      fetchTenders();
      fetchCustomers();
      setShowForm(false);
      setEditingTender(null);
    } catch (error) {
      console.error('Error saving tender:', error);
    }
  };

  const handleDeleteTender = async (tenderId) => {
    if (window.confirm('Are you sure you want to delete this tender?')) {
      try {
        await axios.delete(`${API}/tenders/${tenderId}`);
        fetchTenders();
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting tender:', error);
      }
    }
  };

  const handleEditTender = (tender) => {
    setEditingTender(tender);
    setShowForm(true);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', customer: '' });
  };

  // Enhanced PDF Export Functionality
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Create PDF with landscape orientation and larger size
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 25;
      
      // Professional header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55); // Gray-800
      pdf.text('Sales Dashboard Report', 25, currentY);
      
      currentY += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128); // Gray-500
      const currentDate = new Date();
      pdf.text(`Generated: ${currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 25, currentY);
      
      currentY += 6;
      pdf.text(`Total Tenders: ${filteredTenders.length}`, 25, currentY);
      
      // Add filters information if any are applied
      const activeFilters = [];
      if (filters.status) activeFilters.push(`Status: ${filters.status}`);
      if (filters.priority) activeFilters.push(`Priority: ${filters.priority}`);
      if (filters.customer) activeFilters.push(`Customer: ${filters.customer}`);
      
      if (activeFilters.length > 0) {
        currentY += 4;
        pdf.setFontSize(10);
        pdf.setTextColor(156, 163, 175); // Gray-400
        pdf.text(`Applied Filters: ${activeFilters.join(', ')}`, 25, currentY);
      }
      
      currentY += 15;
      
      // Capture and add GANTT chart with high resolution
      if (ganttRef.current) {
        try {
          const ganttCanvas = await html2canvas(ganttRef.current, {
            backgroundColor: '#ffffff',
            scale: 3, // High resolution
            logging: false,
            useCORS: true,
            allowTaint: true,
            height: ganttRef.current.scrollHeight,
            width: ganttRef.current.scrollWidth
          });
          
          const ganttImageData = ganttCanvas.toDataURL('image/png', 1.0);
          const ganttWidth = pageWidth - 50; // Full width minus margins
          const ganttHeight = (ganttCanvas.height * ganttWidth) / ganttCanvas.width;
          
          // Check if we need a new page
          if (currentY + ganttHeight > pageHeight - 30) {
            pdf.addPage();
            currentY = 25;
          }
          
          pdf.addImage(ganttImageData, 'PNG', 25, currentY, ganttWidth, ganttHeight);
          currentY += ganttHeight + 20;
        } catch (error) {
          console.warn('Error capturing GANTT chart:', error);
        }
      }
      
      // Add charts section with improved capture
      if (chartsRef.current) {
        try {
          // Add page for charts
          pdf.addPage();
          currentY = 25;
          
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(31, 41, 55);
          pdf.text('Analytics Overview', 25, currentY);
          currentY += 15;
          
          const chartsCanvas = await html2canvas(chartsRef.current, {
            backgroundColor: '#ffffff',
            scale: 3, // High resolution
            logging: false,
            useCORS: true,
            allowTaint: true,
            height: chartsRef.current.scrollHeight,
            width: chartsRef.current.scrollWidth
          });
          
          const chartsImageData = chartsCanvas.toDataURL('image/png', 1.0);
          const chartsWidth = pageWidth - 50;
          const chartsHeight = (chartsCanvas.height * chartsWidth) / chartsCanvas.width;
          
          pdf.addImage(chartsImageData, 'PNG', 25, currentY, chartsWidth, chartsHeight);
          currentY += chartsHeight + 20;
        } catch (error) {
          console.warn('Error capturing charts:', error);
        }
      }
      
      // Add tenders table with improved formatting
      if (tableRef.current && filteredTenders.length > 0) {
        // Start table on a new page
        pdf.addPage();
        currentY = 25;
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Detailed Tenders Table', 25, currentY);
        currentY += 15;
        
        // Capture table as image for exact replication
        try {
          const tableCanvas = await html2canvas(tableRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
          });
          
          const tableImageData = tableCanvas.toDataURL('image/png', 1.0);
          const tableWidth = pageWidth - 50;
          const tableHeight = (tableCanvas.height * tableWidth) / tableCanvas.width;
          
          // Split table across pages if needed
          if (tableHeight > pageHeight - currentY - 30) {
            const maxHeight = pageHeight - currentY - 30;
            pdf.addImage(tableImageData, 'PNG', 25, currentY, tableWidth, maxHeight);
            
            // Add continuation on next page if needed
            const remainingHeight = tableHeight - maxHeight;
            if (remainingHeight > 0) {
              pdf.addPage();
              pdf.addImage(tableImageData, 'PNG', 25, 25, tableWidth, remainingHeight, undefined, undefined, -maxHeight);
            }
          } else {
            pdf.addImage(tableImageData, 'PNG', 25, currentY, tableWidth, tableHeight);
          }
        } catch (error) {
          console.warn('Error capturing table:', error);
        }
      }
      
      // Add footer to all pages with enhanced formatting
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Footer line
        pdf.setDrawColor(229, 231, 235); // Gray-200
        pdf.line(25, pageHeight - 15, pageWidth - 25, pageHeight - 15);
        
        // Footer text
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Page ${i} of ${pageCount}`, 25, pageHeight - 8);
        pdf.text(`Sales Dashboard Report - ${currentDate.toISOString().split('T')[0]}`, pageWidth - 80, pageHeight - 8);
      }
      
      // Save the PDF with dynamic filename
      const fileName = `sales-dashboard-report-${currentDate.toISOString().split('T')[0]}-${currentDate.getHours()}${currentDate.getMinutes().toString().padStart(2, '0')}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Live Countdown Panel */}
      <LiveCountdownPanel tenders={filteredTenders} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Tenders Dashboard</h1>
          <p className="text-gray-400 mt-2">Manage your tenders and track the bid process</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>

              <select
                value={filters.customer}
                onChange={(e) => setFilters({...filters, customer: e.target.value})}
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF Report
                  </>
                )}
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                New Tender
              </button>
            </div>
          </div>
        </div>

        {/* GANTT Chart */}
        <div className="mb-6" ref={ganttRef}>
          <GanttChart tenders={filteredTenders} isPrintMode={false} />
        </div>

        {/* Data Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden mb-6" ref={tableRef}>
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100">Tenders ({filteredTenders.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    BID Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Deal Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sales Rep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hover:text-gray-100">
                      {tender.item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {tender.tender_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hover:text-gray-100">
                      {tender.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={tender.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={tender.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100 font-medium">
                      ${tender.deal_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hover:text-gray-100">
                      <div>
                        <div>Start: {new Date(tender.start_date).toLocaleDateString()}</div>
                        <div>End: {new Date(tender.expiry_date).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hover:text-gray-100">
                      <div>
                        <div className="font-medium">
                          {new Date(tender.due_date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 hover:text-gray-100">
                      {tender.assigned_sales_rep}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTender(tender)}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTender(tender.id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No tenders found</div>
              <div className="text-gray-500">Create your first tender to get started</div>
            </div>
          )}
        </div>

        {/* Charts Section - Moved to bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6" ref={chartsRef}>
          <div className="lg:col-span-2 xl:col-span-1">
            <SalesFunnelChart tenders={filteredTenders} />
          </div>
          <div>
            <CustomerDealsPieChart tenders={filteredTenders} />
          </div>
          <div>
            <PriorityBarChart tenders={filteredTenders} />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <TenderForm
            tender={editingTender}
            onSave={handleSaveTender}
            onCancel={() => {
              setShowForm(false);
              setEditingTender(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
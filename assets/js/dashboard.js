/**
 * PAWVOYAGE DASHBOARD JAVASCRIPT
 * Handles Pet Owner Dashboard interactions: tab switching, ride booking mock logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     1. Dashboard Tab Switching
     ------------------------------------------------------------------------ */
  const sidebarLinks = document.querySelectorAll('.dashboard-nav-link');
  const sections = document.querySelectorAll('.dashboard-section');

  const dashMenuBtn = document.querySelector('.dash-menu-toggle');
  const dashboardSidebar = document.querySelector('.dashboard-sidebar');
  const dashCloseBtn = document.querySelector('.dash-sidebar-close');

  function setSidebarOpen(open) {
    if (!dashboardSidebar) return;
    dashboardSidebar.classList.toggle('open', open);
    if (dashMenuBtn) dashMenuBtn.setAttribute('aria-expanded', String(open));
  }

  if (sidebarLinks.length > 0 && sections.length > 0) {
    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Links without a data-target (Logout) are real navigation - leave
        // them alone, or preventDefault swallows the click and blanks the view.
        if (!link.hasAttribute('data-target')) return;

        e.preventDefault();

        // Remove active class from all links and sections
        sidebarLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Show corresponding section
        const targetId = link.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add('active');
        }
        
        // On mobile, close the sidebar drawer after choosing a section
        if (window.innerWidth <= 1024 && dashboardSidebar && dashboardSidebar.classList.contains('open')) {
          setSidebarOpen(false);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. Mock Booking Calendar Logic
     ------------------------------------------------------------------------ */
  const zoneSelect = document.getElementById('booking-zone');
  const dateInput = document.getElementById('booking-date');
  const timeSlotsContainer = document.getElementById('time-slots');
  const confirmBtn = document.getElementById('btn-confirm-booking');

  if (zoneSelect && dateInput && timeSlotsContainer) {
    
    // Disable past dates in date picker
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    const renderTimeSlots = () => {
      const selectedZone = zoneSelect.value;
      const selectedDate = dateInput.value;
      
      if (!selectedZone || !selectedDate) {
        timeSlotsContainer.innerHTML = '<p class="lead-text" style="grid-column: 1/-1;">Please select a service type and pickup date to view available chauffeurs.</p>';
        if(confirmBtn) confirmBtn.disabled = true;
        return;
      }

      // Mock Data: Generate some dispatch slots
      const mockSlots = [
        { time: '08:30 AM', available: true, capacity: 3 },
        { time: '10:00 AM', available: true, capacity: 2 },
        { time: '11:30 AM', available: false, capacity: 0 },
        { time: '01:30 PM', available: true, capacity: 4 },
        { time: '03:00 PM', available: true, capacity: 2 },
        { time: '05:00 PM', available: false, capacity: 0 }
      ];

      timeSlotsContainer.innerHTML = ''; // Clear

      mockSlots.forEach(slot => {
        const slotEl = document.createElement('div');
        slotEl.className = `time-slot ${slot.available ? 'available' : 'unavailable'}`;
        
        slotEl.innerHTML = `
          <strong>${slot.time}</strong>
          <span class="slot-capacity">${slot.available ? slot.capacity + ' vans open' : 'Booked'}</span>
        `;
        
        if (slot.available) {
          slotEl.addEventListener('click', () => {
            // Deselect others
            document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
            slotEl.classList.add('selected');
            if(confirmBtn) confirmBtn.disabled = false;
          });
        }
        
        timeSlotsContainer.appendChild(slotEl);
      });
    };

    zoneSelect.addEventListener('change', renderTimeSlots);
    dateInput.addEventListener('change', renderTimeSlots);
  }

  /* ------------------------------------------------------------------------
     3. Mobile Dashboard Sidebar Toggle
     ------------------------------------------------------------------------ */
  if (dashMenuBtn && dashboardSidebar) {
    dashMenuBtn.addEventListener('click', () => {
      setSidebarOpen(!dashboardSidebar.classList.contains('open'));
    });
  }

  if (dashCloseBtn) {
    dashCloseBtn.addEventListener('click', () => {
      setSidebarOpen(false);
    });
  }

  document.addEventListener('click', (e) => {
    if (
      window.innerWidth <= 1024 &&
      dashboardSidebar &&
      dashboardSidebar.classList.contains('open') &&
      !dashboardSidebar.contains(e.target) &&
      (!dashMenuBtn || !dashMenuBtn.contains(e.target))
    ) {
      setSidebarOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dashboardSidebar && dashboardSidebar.classList.contains('open')) {
      setSidebarOpen(false);
    }
  });

  /* ------------------------------------------------------------------------
     4. Top-bar Profile Menu
     ------------------------------------------------------------------------ */
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');

  if (profileBtn && profileDropdown) {
    const closeProfile = () => {
      profileDropdown.classList.remove('open');
      profileBtn.setAttribute('aria-expanded', 'false');
    };

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = profileDropdown.classList.toggle('open');
      profileBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && e.target !== profileBtn) closeProfile();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProfile();
    });

    // Menu items that point at a dashboard section reuse the sidebar logic,
    // so the sidebar highlight stays in sync.
    profileDropdown.querySelectorAll('.profile-item[data-target]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        const sidebarLink = document.querySelector(`.dashboard-nav-link[data-target="${target}"]`);
        if (sidebarLink) sidebarLink.click();
        closeProfile();
      });
    });
  }
});

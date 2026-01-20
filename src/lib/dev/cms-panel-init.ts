/**
 * CMS Control Panel Controller
 *
 * Handles panel initialization, hover detection, filtering, and sorting.
 * Uses visual indicators instead of DOM manipulation to preserve layouts.
 * Only runs in development mode.
 */

import {
  discoverSectionFromDOM,
  type CMSSection,
  type FilterCondition,
  type FilterOption,
  type FilterOperator,
  type SortOption,
  OPERATORS_BY_FIELD_TYPE,
  OPERATOR_LABELS,
  SORT_DIRECTION_LABELS,
  parseUrlParams,
  updateUrlParams,
  loadPreferences,
  savePreferences,
} from './cms-panel';

interface PanelState {
  activeSection: CMSSection | null;
  activeSectionElement: HTMLElement | null;
  filters: FilterCondition[];
  sort: { field: string; dir: 'asc' | 'desc' } | null;
  visibleCount: number;
  totalCount: number;
}

let panelElement: HTMLElement | null = null;
let hintElement: HTMLElement | null = null;
let state: PanelState = {
  activeSection: null,
  activeSectionElement: null,
  filters: [],
  sort: null,
  visibleCount: 0,
  totalCount: 0,
};

// Initialize the CMS control panel
export function initCMSPanel() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Create panel elements
  createPanelElement();
  createHintElement();

  // Attach hover listeners to CMS sections
  attachSectionListeners();

  // Handle keyboard shortcuts
  document.addEventListener('keydown', handleKeydown);

  // Apply URL params on load
  applyInitialState();

  // Show hint briefly
  showHint();
}

function createPanelElement() {
  panelElement = document.createElement('div');
  panelElement.className = 'cms-control-panel';
  panelElement.innerHTML = `
    <div class="cms-panel-header">
      <div class="cms-panel-title">
        <svg class="cms-panel-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span class="cms-panel-title-text">CMS Control</span>
      </div>
      <button class="cms-panel-close" aria-label="Close panel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="cms-panel-body">
      <div class="cms-panel-empty">Hover over a CMS section to configure</div>
    </div>
    <div class="cms-panel-footer">
      <span class="cms-panel-count">
        <strong class="cms-panel-visible">0</strong> of <strong class="cms-panel-total">0</strong> items match
      </span>
      <div class="cms-panel-actions">
        <button class="cms-panel-btn cms-panel-reset">Reset</button>
        <button class="cms-panel-btn cms-panel-copy">Copy URL</button>
      </div>
    </div>
  `;

  document.body.appendChild(panelElement);

  // Event listeners
  panelElement.querySelector('.cms-panel-close')?.addEventListener('click', hidePanel);
  panelElement.querySelector('.cms-panel-reset')?.addEventListener('click', resetFilters);
  panelElement.querySelector('.cms-panel-copy')?.addEventListener('click', copyUrl);
}

function createHintElement() {
  hintElement = document.createElement('div');
  hintElement.className = 'cms-panel-hint';
  hintElement.innerHTML = `Hover CMS sections and click <svg style="display:inline;width:12px;height:12px;vertical-align:-2px;margin:0 2px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.79 1.03 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> to configure`;
  document.body.appendChild(hintElement);
}

function showHint() {
  if (!hintElement) return;
  hintElement.classList.add('is-visible');
  setTimeout(() => {
    hintElement?.classList.remove('is-visible');
  }, 3000);
}

function attachSectionListeners() {
  document.querySelectorAll<HTMLElement>('[data-cms-section]').forEach(section => {
    // Auto-discover section config from DOM (no manual registration needed!)
    const config = discoverSectionFromDOM(section);

    if (!config) return;

    // Detect if section overflows viewport (for horizontal sliders, etc.)
    const detectOverflow = () => {
      const rect = section.getBoundingClientRect();
      const isOverflowing = rect.width > window.innerWidth || rect.right > window.innerWidth;
      section.classList.toggle('cms-section-overflows', isOverflowing);
    };
    detectOverflow();
    // Re-check on resize
    window.addEventListener('resize', detectOverflow, { passive: true });

    // Create cogwheel settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'cms-section-settings';
    settingsBtn.setAttribute('aria-label', 'Configure CMS section');
    settingsBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    `;
    section.appendChild(settingsBtn);

    // Open panel only when cogwheel is clicked
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveSection(config, section);
      showPanel();
    });
  });
}

function setActiveSection(config: CMSSection, element: HTMLElement) {
  // Clear previous active state
  clearVisualIndicators();
  document.querySelectorAll('.cms-panel-active').forEach(el => {
    el.classList.remove('cms-panel-active');
  });

  // Set new active section
  element.classList.add('cms-panel-active');
  state.activeSection = config;
  state.activeSectionElement = element;

  // Load existing state from URL or defaults
  const urlParams = parseUrlParams();
  const sectionParams = urlParams.get(config.id);
  const prefs = loadPreferences();
  const defaults = prefs.defaults[config.id] || {};

  state.filters = sectionParams?.filters || defaults.filters || [];
  state.sort = sectionParams?.sort || defaults.sort || null;

  // Update panel UI
  updatePanelUI(config, element);

  // Apply visual indicators (show which items match current filters)
  applyVisualIndicators(config, element);

  // Note: Panel is NOT shown here - it's shown when cogwheel is clicked
}

function updatePanelUI(config: CMSSection, sectionElement: HTMLElement) {
  if (!panelElement) return;

  const titleText = panelElement.querySelector('.cms-panel-title-text');
  if (titleText) titleText.textContent = config.label;

  const body = panelElement.querySelector('.cms-panel-body');
  if (!body) return;

  // Build filter value options from DOM data
  const items = sectionElement.querySelectorAll<HTMLElement>('[data-cms-item]');
  const filterValueOptions = buildFilterValueOptions(config, items);

  // Generate controls HTML
  let html = '';

  // Filters section
  if (config.filters.length > 0) {
    html += `<div class="cms-panel-section">
      <div class="cms-panel-section-header">
        <span class="cms-panel-section-label">Filter by</span>
        <button class="cms-panel-add-filter" type="button">+ Add</button>
      </div>
      <div class="cms-panel-filters-list">
        ${renderFilterRows(config, filterValueOptions)}
      </div>
    </div>`;
  }

  // Sort section
  if (config.sorts.length > 0) {
    const currentSortField = state.sort?.field || '';
    const currentSortDir = state.sort?.dir || 'asc';
    const currentSortOption = config.sorts.find(s => s.field === currentSortField);
    const sortType = currentSortOption?.type || 'text';
    const dirLabels = SORT_DIRECTION_LABELS[sortType];
    const dirLabel = currentSortDir === 'asc' ? dirLabels.asc : dirLabels.desc;

    html += `<div class="cms-panel-section">
      <span class="cms-panel-section-label">Sort by</span>
      <div class="cms-panel-sort-row">
        <select class="cms-panel-select cms-panel-sort-field" data-sort-field>
          <option value="">None</option>
          ${config.sorts.map(sort => `
            <option value="${sort.field}" data-sort-type="${sort.type}" ${sort.field === currentSortField ? 'selected' : ''}>
              ${sort.label}
            </option>
          `).join('')}
        </select>
        <select class="cms-panel-select cms-panel-sort-dir" data-sort-dir ${!currentSortField ? 'disabled' : ''}>
          <option value="asc" ${currentSortDir === 'asc' ? 'selected' : ''}>${dirLabels.asc}</option>
          <option value="desc" ${currentSortDir === 'desc' ? 'selected' : ''}>${dirLabels.desc}</option>
        </select>
      </div>
    </div>`;
  }

  // Apply button
  html += `<div class="cms-panel-apply-section">
    <button class="cms-panel-btn cms-panel-apply is-primary">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 11-3-6.7"/>
        <path d="M21 4v4h-4"/>
      </svg>
      Apply & Reload
    </button>
    <span class="cms-panel-apply-hint">Reloads page with filter/sort applied server-side</span>
  </div>`;

  if (config.filters.length === 0 && config.sorts.length === 0) {
    html = '<div class="cms-panel-empty">No filters available for this section</div>';
  }

  body.innerHTML = html;

  // Attach event listeners
  attachFilterListeners(body, config, sectionElement, filterValueOptions);
  attachSortListeners(body, config, sectionElement);
  attachApplyListener(body, config);

  // Update counts
  updateCounts(sectionElement);
}

function renderFilterRows(
  config: CMSSection,
  filterValueOptions: Map<string, { value: string; label: string; count: number }[]>
): string {
  // Ensure at least one empty row if no filters exist
  const filters = state.filters.length > 0 ? state.filters : [];

  if (filters.length === 0) {
    return '<div class="cms-panel-no-filters">No filters applied</div>';
  }

  return filters.map((condition, index) => {
    return renderFilterRow(config, filterValueOptions, condition, index);
  }).join('');
}

function renderFilterRow(
  config: CMSSection,
  filterValueOptions: Map<string, { value: string; label: string; count: number }[]>,
  condition: FilterCondition,
  index: number
): string {
  const selectedFilterOption = config.filters.find(f => f.field === condition.field);
  const fieldType = selectedFilterOption?.type || 'text';
  const availableOperators = OPERATORS_BY_FIELD_TYPE[fieldType];
  const needsValue = ['equals', 'not_equals'].includes(condition.operator);
  const valueOptions = filterValueOptions.get(condition.field) || [];

  return `
    <div class="cms-panel-filter-row" data-filter-index="${index}">
      <select class="cms-panel-select cms-panel-filter-field" data-filter-field="${index}">
        <option value="">Select field...</option>
        ${config.filters.map(filter => `
          <option value="${filter.field}" data-field-type="${filter.type}" ${filter.field === condition.field ? 'selected' : ''}>
            ${filter.label}
          </option>
        `).join('')}
      </select>
      <select class="cms-panel-select cms-panel-filter-operator" data-filter-operator="${index}" ${!condition.field ? 'disabled' : ''}>
        ${availableOperators.map(op => `
          <option value="${op}" ${op === condition.operator ? 'selected' : ''}>
            ${OPERATOR_LABELS[op]}
          </option>
        `).join('')}
      </select>
      ${needsValue ? `
        ${fieldType === 'reference' ? `
          <select class="cms-panel-select cms-panel-filter-value" data-filter-value="${index}">
            <option value="">Select...</option>
            ${valueOptions.map(opt => `
              <option value="${opt.value}" ${opt.value === condition.value ? 'selected' : ''}>
                ${opt.label} (${opt.count})
              </option>
            `).join('')}
          </select>
        ` : `
          <input
            type="text"
            class="cms-panel-input cms-panel-filter-value"
            data-filter-value="${index}"
            placeholder="Enter value..."
            value="${condition.value || ''}"
          />
        `}
      ` : `
        <div class="cms-panel-filter-value-placeholder"></div>
      `}
      <button class="cms-panel-filter-remove" data-filter-remove="${index}" type="button" aria-label="Remove filter">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;
}

function attachFilterListeners(
  body: Element,
  config: CMSSection,
  sectionElement: HTMLElement,
  filterValueOptions: Map<string, { value: string; label: string; count: number }[]>
) {
  // Add filter button
  body.querySelector('.cms-panel-add-filter')?.addEventListener('click', () => {
    state.filters.push({ field: '', operator: 'equals', value: '' });
    updatePanelUI(config, sectionElement);
    applyVisualIndicators(config, sectionElement);
  });

  // Field selectors
  body.querySelectorAll<HTMLSelectElement>('[data-filter-field]').forEach(select => {
    select.addEventListener('change', () => {
      const index = parseInt(select.dataset.filterField!, 10);
      const newField = select.value;
      const selectedOption = select.options[select.selectedIndex];
      const fieldType = selectedOption.dataset.fieldType || 'text';

      // Get default operator for this field type
      const defaultOperator = OPERATORS_BY_FIELD_TYPE[fieldType as keyof typeof OPERATORS_BY_FIELD_TYPE][0];

      state.filters[index] = {
        field: newField,
        operator: defaultOperator,
        value: '',
      };

      updatePanelUI(config, sectionElement);
      applyVisualIndicators(config, sectionElement);
      persistState(config);
    });
  });

  // Operator selectors
  body.querySelectorAll<HTMLSelectElement>('[data-filter-operator]').forEach(select => {
    select.addEventListener('change', () => {
      const index = parseInt(select.dataset.filterOperator!, 10);
      const newOperator = select.value as FilterOperator;

      state.filters[index].operator = newOperator;

      // Clear value if switching to is_set/is_not_set
      if (['is_set', 'is_not_set'].includes(newOperator)) {
        state.filters[index].value = '';
      }

      updatePanelUI(config, sectionElement);
      applyVisualIndicators(config, sectionElement);
      persistState(config);
    });
  });

  // Value inputs/selects
  body.querySelectorAll<HTMLSelectElement | HTMLInputElement>('[data-filter-value]').forEach(input => {
    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventType, () => {
      const index = parseInt(input.dataset.filterValue!, 10);
      state.filters[index].value = input.value;
      applyVisualIndicators(config, sectionElement);
      persistState(config);
    });
  });

  // Remove buttons
  body.querySelectorAll<HTMLButtonElement>('[data-filter-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.filterRemove!, 10);
      state.filters.splice(index, 1);
      updatePanelUI(config, sectionElement);
      applyVisualIndicators(config, sectionElement);
      persistState(config);
    });
  });
}

function attachSortListeners(body: Element, config: CMSSection, sectionElement: HTMLElement) {
  const fieldSelect = body.querySelector<HTMLSelectElement>('[data-sort-field]');
  const dirSelect = body.querySelector<HTMLSelectElement>('[data-sort-dir]');

  fieldSelect?.addEventListener('change', () => {
    const field = fieldSelect.value;
    const selectedOption = fieldSelect.options[fieldSelect.selectedIndex];
    const sortType = (selectedOption.dataset.sortType || 'text') as 'text' | 'date' | 'number';

    if (field) {
      state.sort = { field, dir: state.sort?.dir || 'asc' };

      // Update direction labels based on field type
      if (dirSelect) {
        const labels = SORT_DIRECTION_LABELS[sortType];
        dirSelect.innerHTML = `
          <option value="asc" ${state.sort.dir === 'asc' ? 'selected' : ''}>${labels.asc}</option>
          <option value="desc" ${state.sort.dir === 'desc' ? 'selected' : ''}>${labels.desc}</option>
        `;
        dirSelect.disabled = false;
      }
    } else {
      state.sort = null;
      if (dirSelect) {
        dirSelect.disabled = true;
      }
    }

    applyVisualIndicators(config, sectionElement);
    persistState(config);
  });

  dirSelect?.addEventListener('change', () => {
    const dir = dirSelect.value as 'asc' | 'desc';
    if (state.sort) {
      state.sort.dir = dir;
    }
    applyVisualIndicators(config, sectionElement);
    persistState(config);
  });
}

function attachApplyListener(body: Element, config: CMSSection) {
  body.querySelector<HTMLButtonElement>('.cms-panel-apply')?.addEventListener('click', async () => {
    const btn = body.querySelector<HTMLButtonElement>('.cms-panel-apply');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cms-spin">
          <path d="M21 12a9 9 0 11-3-6.7"/>
          <path d="M21 4v4h-4"/>
        </svg>
        Saving...
      `;
    }

    try {
      // Filter out incomplete conditions before saving
      const validFilters = state.filters.filter(f => {
        if (!f.field) return false;
        // For equals/not_equals, require a value (unless it's intentionally empty string match)
        if (['equals', 'not_equals'].includes(f.operator) && !f.value) return false;
        return true;
      });

      await saveConfigToFile(config.id, validFilters, state.sort);
      // Reload after successful save
      window.location.reload();
    } catch (error) {
      console.error('Failed to save config:', error);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-3-6.7"/>
            <path d="M21 4v4h-4"/>
          </svg>
          Apply & Reload
        `;
      }
      alert('Failed to save configuration. Check console for details.');
    }
  });
}

function buildFilterValueOptions(config: CMSSection, items: NodeListOf<HTMLElement>) {
  const options = new Map<string, { value: string; label: string; count: number }[]>();

  config.filters.forEach(filter => {
    const valueMap = new Map<string, { label: string; count: number }>();

    items.forEach(item => {
      const value = item.dataset[`cms${capitalize(filter.field)}`] || '';
      const label = item.dataset[`cms${capitalize(filter.field)}Label`] || value;

      if (value) {
        const existing = valueMap.get(value);
        if (existing) {
          existing.count++;
        } else {
          valueMap.set(value, { label, count: 1 });
        }
      }
    });

    const sorted = Array.from(valueMap.entries())
      .map(([value, data]) => ({ value, label: data.label, count: data.count }))
      .sort((a, b) => a.label.localeCompare(b.label));

    options.set(filter.field, sorted);
  });

  return options;
}

function capitalize(str: string): string {
  return str.split('-').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
}

function applyVisualIndicators(config: CMSSection, sectionElement: HTMLElement) {
  const items = Array.from(sectionElement.querySelectorAll<HTMLElement>('[data-cms-item]'));

  // Remove existing indicators
  clearVisualIndicators();

  // Track which items match filters
  const matchingItems: { element: HTMLElement; sortValue: string }[] = [];

  items.forEach(item => {
    let matches = true;

    // Check all filter conditions
    for (const condition of state.filters) {
      if (!condition.field) continue;

      const itemValue = item.dataset[`cms${capitalize(condition.field)}`] || '';
      const isSet = itemValue.trim() !== '';

      switch (condition.operator) {
        case 'is_set':
          if (!isSet) matches = false;
          break;
        case 'is_not_set':
          if (isSet) matches = false;
          break;
        case 'equals':
          if (condition.value && itemValue !== condition.value) matches = false;
          break;
        case 'not_equals':
          if (condition.value && itemValue === condition.value) matches = false;
          break;
      }

      if (!matches) break;
    }

    if (matches) {
      item.classList.remove('cms-dimmed');
      const sortValue = state.sort
        ? item.dataset[`cms${capitalize(state.sort.field)}`] || ''
        : '';
      matchingItems.push({ element: item, sortValue });
    } else {
      item.classList.add('cms-dimmed');
    }
  });

  // Apply sort badges if sorting is active
  if (state.sort && matchingItems.length > 0) {
    // Sort the matching items
    matchingItems.sort((a, b) => {
      const aVal = a.sortValue;
      const bVal = b.sortValue;

      // Check if values are dates
      const aDate = Date.parse(aVal);
      const bDate = Date.parse(bVal);

      let comparison: number;
      if (!isNaN(aDate) && !isNaN(bDate)) {
        comparison = aDate - bDate;
      } else if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
        comparison = Number(aVal) - Number(bVal);
      } else {
        comparison = aVal.localeCompare(bVal);
      }

      return state.sort!.dir === 'asc' ? comparison : -comparison;
    });

    // Add sort badges
    matchingItems.forEach((item, index) => {
      const badge = document.createElement('div');
      badge.className = 'cms-sort-badge';
      badge.textContent = String(index + 1);
      badge.setAttribute('data-cms-badge', 'true');

      // Position badge relative to item
      const rect = item.element.getBoundingClientRect();
      badge.style.position = 'fixed';
      badge.style.top = `${rect.top + 8}px`;
      badge.style.left = `${rect.left + 8}px`;
      badge.style.zIndex = '10001';

      document.body.appendChild(badge);
    });
  }

  // Update counts
  state.visibleCount = matchingItems.length;
  state.totalCount = items.length;
  updateCountsDisplay();
}

function clearVisualIndicators() {
  // Remove dimmed class from all items
  document.querySelectorAll('.cms-dimmed').forEach(el => {
    el.classList.remove('cms-dimmed');
  });

  // Remove all sort badges
  document.querySelectorAll('[data-cms-badge]').forEach(el => {
    el.remove();
  });
}

function updateCounts(sectionElement: HTMLElement) {
  const items = sectionElement.querySelectorAll('[data-cms-item]');
  const matching = sectionElement.querySelectorAll('[data-cms-item]:not(.cms-dimmed)');

  state.totalCount = items.length;
  state.visibleCount = matching.length;

  updateCountsDisplay();
}

function updateCountsDisplay() {
  if (!panelElement) return;

  const visibleEl = panelElement.querySelector('.cms-panel-visible');
  const totalEl = panelElement.querySelector('.cms-panel-total');

  if (visibleEl) visibleEl.textContent = String(state.visibleCount);
  if (totalEl) totalEl.textContent = String(state.totalCount);
}

function persistState(config: CMSSection) {
  // Update URL params (for visual preview sharing)
  updateUrlParams(config.id, state.filters, state.sort || undefined);

  // Save as default preference (for session persistence)
  const prefs = loadPreferences();
  prefs.defaults[config.id] = {
    filters: state.filters,
    sort: state.sort || undefined,
  };
  savePreferences(prefs);
}

async function saveConfigToFile(
  sectionId: string,
  filters: FilterCondition[],
  sort: { field: string; dir: 'asc' | 'desc' } | null
): Promise<void> {
  const response = await fetch('/api/dev/cms-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sectionId,
      filters,
      sort,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save config');
  }
}

async function resetConfigFile(sectionId: string): Promise<void> {
  const response = await fetch('/api/dev/cms-config', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset config');
  }
}

async function resetFilters() {
  if (!state.activeSection || !state.activeSectionElement) return;

  const resetBtn = panelElement?.querySelector<HTMLButtonElement>('.cms-panel-reset');
  if (resetBtn) {
    resetBtn.disabled = true;
    resetBtn.textContent = 'Resetting...';
  }

  try {
    // Reset config file via API
    await resetConfigFile(state.activeSection.id);

    state.filters = [];
    state.sort = null;

    // Clear visual indicators
    clearVisualIndicators();

    // Clear URL params
    updateUrlParams(state.activeSection.id, [], undefined);

    // Clear saved preferences
    const prefs = loadPreferences();
    delete prefs.defaults[state.activeSection.id];
    savePreferences(prefs);

    // Reload to see changes
    window.location.reload();
  } catch (error) {
    console.error('Failed to reset config:', error);
    if (resetBtn) {
      resetBtn.disabled = false;
      resetBtn.textContent = 'Reset';
    }
    // Still update UI locally
    state.filters = [];
    state.sort = null;
    clearVisualIndicators();
    updatePanelUI(state.activeSection, state.activeSectionElement);
    applyVisualIndicators(state.activeSection, state.activeSectionElement);
  }
}

function copyUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = panelElement?.querySelector('.cms-panel-copy');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1500);
    }
  });
}

function showPanel() {
  panelElement?.classList.add('is-visible');
}

function hidePanel() {
  panelElement?.classList.remove('is-visible');
  clearVisualIndicators();
  document.querySelectorAll('.cms-panel-active').forEach(el => {
    el.classList.remove('cms-panel-active');
  });
  state.activeSection = null;
  state.activeSectionElement = null;
}

function handleKeydown(e: KeyboardEvent) {
  // Ignore if typing in an input
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return;
  }

  if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
    // Toggle panel visibility
    if (panelElement?.classList.contains('is-visible')) {
      hidePanel();
    } else {
      // Find first CMS section and activate it (auto-discovered from DOM)
      const firstSection = document.querySelector<HTMLElement>('[data-cms-section]');
      if (firstSection) {
        const config = discoverSectionFromDOM(firstSection);
        if (config) {
          setActiveSection(config, firstSection);
          showPanel(); // Show panel when using keyboard shortcut
        }
      }
    }
  } else if (e.key === 'Escape') {
    hidePanel();
  }
}

function applyInitialState() {
  const urlParams = parseUrlParams();

  // Just load preferences, don't apply visual indicators until hover
  urlParams.forEach((params, sectionId) => {
    const prefs = loadPreferences();
    prefs.defaults[sectionId] = {
      filters: params.filters,
      sort: params.sort,
    };
    savePreferences(prefs);
  });
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMSPanel);
  } else {
    initCMSPanel();
  }
}

# Android App Integration Guide - Community Updates Display

## Overview

This guide explains how the Android app fetches and displays community updates data directly from Firestore. When an admin creates a new community event in the web app, it appears in real-time in the Android app's "Community Update" section without requiring push notifications.

---

## Architecture Flow

```
Web App (React)
    ↓
Create Community Event in Firestore
    ↓
Firestore Document Stored
    ↓
Android App Listens to Firestore
    ↓
Real-time Data Update Received
    ↓
Community Update Card Updated in App UI
    ↓
User Sees Updated Event Details
```

**No Cloud Functions needed. No Push Notifications. Just Firestore real-time listeners.**

---

## Setup Requirements

### 1. Add Firebase Dependencies

Add to `build.gradle` (App level):

```gradle
dependencies {
    // Firebase Firestore (for real-time data)
    implementation 'com.google.firebase:firebase-firestore:24.7.1'
    
    // Firebase Auth
    implementation 'com.google.firebase:firebase-auth:22.1.2'
    
    // RecyclerView for displaying updates
    implementation 'androidx.recyclerview:recyclerview:1.3.0'
}

apply plugin: 'com.google.gms.google-services'
```

**No Firebase Cloud Messaging needed!**

---

## Implementation Steps

### Step 1: Create Data Model

Create `CommunityUpdate.kt`:

```kotlin
package com.samparka.app.data

data class CommunityUpdate(
    val id: String = "",
    val eventName: String = "",
    val date: String = "",
    val time: String = "",
    val description: String = "",
    val createdAt: Long = 0
)
```

### Step 2: Create Repository for Firestore Queries

Create `CommunityUpdateRepository.kt`:

```kotlin
package com.samparka.app.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.samparka.app.data.CommunityUpdate
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class CommunityUpdateRepository {
    private val db = FirebaseFirestore.getInstance()
    private val updatesCollection = db.collection("communityUpdates")

    // Real-time listener for latest community update
    fun getLatestCommunityUpdate(): Flow<CommunityUpdate?> = callbackFlow {
        val listener = updatesCollection
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(1)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }

                val update = snapshot?.documents?.firstOrNull()?.toObject(CommunityUpdate::class.java)
                trySend(update)
            }

        awaitClose { listener.remove() }
    }

    // Get all community updates
    fun getAllCommunityUpdates(): Flow<List<CommunityUpdate>> = callbackFlow {
        val listener = updatesCollection
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }

                val updates = snapshot?.toObjects(CommunityUpdate::class.java) ?: emptyList()
                trySend(updates)
            }

        awaitClose { listener.remove() }
    }

    // Get single update by ID
    suspend fun getCommunityUpdateById(updateId: String): CommunityUpdate? {
        return updatesCollection.document(updateId).get().await()
            .toObject(CommunityUpdate::class.java)
    }
}
```

### Step 3: Create ViewModel

Create `CommunityUpdateViewModel.kt`:

```kotlin
package com.samparka.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.samparka.app.data.CommunityUpdate
import com.samparka.app.repository.CommunityUpdateRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CommunityUpdateViewModel : ViewModel() {
    private val repository = CommunityUpdateRepository()

    // For single latest update card
    private val _latestUpdate = MutableStateFlow<CommunityUpdate?>(null)
    val latestUpdate: StateFlow<CommunityUpdate?> = _latestUpdate.asStateFlow()

    // For full list of updates
    private val _allUpdates = MutableStateFlow<List<CommunityUpdate>>(emptyList())
    val allUpdates: StateFlow<List<CommunityUpdate>> = _allUpdates.asStateFlow()

    // Loading and error states
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadCommunityUpdates()
    }

    fun loadCommunityUpdates() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                repository.getLatestCommunityUpdate().collect { update ->
                    _latestUpdate.value = update
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _isLoading.value = false
            }
        }

        viewModelScope.launch {
            try {
                repository.getAllCommunityUpdates().collect { updates ->
                    _allUpdates.value = updates
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
```

### Step 4: Create UI Fragment for Community Updates Card

Create `CommunityUpdateFragment.kt` (For the green Community Update card):

```kotlin
package com.samparka.app.ui.community

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.samparka.app.databinding.FragmentCommunityUpdateBinding
import com.samparka.app.viewmodel.CommunityUpdateViewModel
import kotlinx.coroutines.launch

class CommunityUpdateFragment : Fragment() {
    private lateinit var binding: FragmentCommunityUpdateBinding
    private val viewModel: CommunityUpdateViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentCommunityUpdateBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.latestUpdate.collect { update ->
                if (update != null) {
                    displayUpdate(update)
                } else {
                    displayNoUpdates()
                }
            }
        }

        // Click listener to view all updates
        binding.communityUpdateCard.setOnClickListener {
            // Navigate to full community updates list
            // findNavController().navigate(R.id.action_home_to_communityUpdates)
        }
    }

    private fun displayUpdate(update: CommunityUpdate) {
        binding.apply {
            // Show update card
            communityUpdateCard.visibility = View.VISIBLE
            noUpdatesView.visibility = View.GONE

            updateTitle.text = "📢 ${update.eventName}"
            updateDate.text = "📅 ${update.date}"
            updateTime.text = "⏰ ${update.time}"
            updateDescription.text = update.description

            // Set status badge
            updateStatus.text = "Latest Update"
            updateStatus.setTextColor(resources.getColor(android.R.color.holo_green_dark))
        }
    }

    private fun displayNoUpdates() {
        binding.apply {
            communityUpdateCard.visibility = View.GONE
            noUpdatesView.visibility = View.VISIBLE
            noUpdatesText.text = "No updates available"
        }
    }
}
```

### Step 5: Layout XML for Community Update Card

Create `fragment_community_update.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="16dp">

    <!-- Community Update Card -->
    <LinearLayout
        android:id="@+id/communityUpdateCard"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:background="#4CAF50"
        android:backgroundTint="#4CAF50"
        android:padding="16dp"
        android:layout_marginBottom="16dp"
        android:visibility="visible">

        <TextView
            android:id="@+id/updateTitle"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="📢 Community Update"
            android:textColor="@android:color/white"
            android:textSize="18sp"
            android:textStyle="bold"
            android:layout_marginBottom="8dp" />

        <TextView
            android:id="@+id/updateDate"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="📅 Date: 2025-02-10"
            android:textColor="@android:color/white"
            android:textSize="14sp"
            android:layout_marginBottom="4dp" />

        <TextView
            android:id="@+id/updateTime"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="⏰ Time: 10:00 AM"
            android:textColor="@android:color/white"
            android:textSize="14sp"
            android:layout_marginBottom="8dp" />

        <TextView
            android:id="@+id/updateDescription"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:text="Event description here..."
            android:textColor="@android:color/white"
            android:textSize="13sp"
            android:layout_marginBottom="8dp" />

        <TextView
            android:id="@+id/updateStatus"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Latest Update"
            android:textColor="@android:color/white"
            android:textSize="12sp"
            android:textStyle="bold" />

    </LinearLayout>

    <!-- No Updates View -->
    <LinearLayout
        android:id="@+id/noUpdatesView"
        android:layout_width="match_parent"
        android:layout_height="120dp"
        android:orientation="vertical"
        android:background="#4CAF50"
        android:gravity="center"
        android:padding="16dp"
        android:visibility="gone">

        <TextView
            android:id="@+id/noUpdatesText"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="No updates available"
            android:textColor="@android:color/white"
            android:textSize="16sp"
            android:textStyle="bold" />

    </LinearLayout>

</LinearLayout>
```

### Step 6: Full Community Updates List Fragment

Create `CommunityUpdatesListFragment.kt` (for full page view):

```kotlin
package com.samparka.app.ui.community

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.samparka.app.databinding.FragmentCommunityUpdatesListBinding
import com.samparka.app.viewmodel.CommunityUpdateViewModel
import kotlinx.coroutines.launch

class CommunityUpdatesListFragment : Fragment() {
    private lateinit var binding: FragmentCommunityUpdatesListBinding
    private val viewModel: CommunityUpdateViewModel by viewModels()
    private lateinit var adapter: CommunityUpdateAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentCommunityUpdatesListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Setup RecyclerView
        adapter = CommunityUpdateAdapter()
        binding.updatesRecyclerView.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = this@CommunityUpdatesListFragment.adapter
        }

        // Observe updates
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.allUpdates.collect { updates ->
                adapter.submitList(updates)

                // Show/hide empty state
                if (updates.isEmpty()) {
                    binding.emptyState.visibility = View.VISIBLE
                    binding.updatesRecyclerView.visibility = View.GONE
                } else {
                    binding.emptyState.visibility = View.GONE
                    binding.updatesRecyclerView.visibility = View.VISIBLE
                }
            }
        }
    }
}
```

### Step 7: RecyclerView Adapter

Create `CommunityUpdateAdapter.kt`:

```kotlin
package com.samparka.app.ui.community

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.samparka.app.data.CommunityUpdate
import com.samparka.app.databinding.ItemCommunityUpdateBinding

class CommunityUpdateAdapter : 
    ListAdapter<CommunityUpdate, CommunityUpdateAdapter.ViewHolder>(CommunityUpdateDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemCommunityUpdateBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(private val binding: ItemCommunityUpdateBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(update: CommunityUpdate) {
            binding.apply {
                eventNameText.text = "📢 ${update.eventName}"
                dateText.text = "📅 ${update.date}"
                timeText.text = "⏰ ${update.time}"
                descriptionText.text = update.description
                
                // Format created date
                val createdDate = java.text.SimpleDateFormat("MMM d, yyyy", java.util.Locale.US)
                    .format(java.util.Date(update.createdAt))
                createdAtText.text = "Posted: $createdDate"
            }
        }
    }

    class CommunityUpdateDiffCallback : DiffUtil.ItemCallback<CommunityUpdate>() {
        override fun areItemsTheSame(oldItem: CommunityUpdate, newItem: CommunityUpdate) =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: CommunityUpdate, newItem: CommunityUpdate) =
            oldItem == newItem
    }
}
```

### Step 8: RecyclerView Item Layout

Create `item_community_update.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="@android:color/white"
    android:padding="16dp"
    android:layout_margin="8dp">

    <TextView
        android:id="@+id/eventNameText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Event Name"
        android:textColor="#111827"
        android:textSize="16sp"
        android:textStyle="bold"
        android:layout_marginBottom="8dp" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginBottom="8dp">

        <TextView
            android:id="@+id/dateText"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Date"
            android:textColor="#6b7280"
            android:textSize="14sp" />

        <TextView
            android:id="@+id/timeText"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Time"
            android:textColor="#6b7280"
            android:textSize="14sp" />

    </LinearLayout>

    <TextView
        android:id="@+id/descriptionText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Description"
        android:textColor="#374151"
        android:textSize="13sp"
        android:layout_marginBottom="8dp" />

    <TextView
        android:id="@+id/createdAtText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Posted"
        android:textColor="#9ca3af"
        android:textSize="12sp" />

</LinearLayout>
```

---

## How It Works in the Android App

### User Sees Community Update in Green Card

The green "Community Update" card displays:
```
┌─────────────────────────────────┐
│ 📢 Community Health Camp 2025    │
│                                 │
│ 📅 Date: 2025-02-10             │
│ ⏰ Time: 10:00 AM               │
│                                 │
│ Free health checkup camp for... │
│                                 │
│ Latest Update                   │
└─────────────────────────────────┘
```

### Real-time Flow

1. **Admin creates event** in web app
2. **Event saved** to Firestore `communityUpdates` collection
3. **Firestore listener** detects new document
4. **Android app's Repository** emits new data via Flow
5. **ViewModel** receives and updates StateFlow
6. **UI Fragment** re-renders with new data
7. **User sees updated event** in green card instantly

---

## Integration Checklist

- [ ] Add Firestore dependency to build.gradle
- [ ] Create CommunityUpdate data model
- [ ] Create CommunityUpdateRepository
- [ ] Create CommunityUpdateViewModel
- [ ] Create CommunityUpdateFragment (for green card)
- [ ] Create CommunityUpdatesListFragment (for full page)
- [ ] Create CommunityUpdateAdapter for RecyclerView
- [ ] Create XML layouts for card and list items
- [ ] Add fragments to navigation
- [ ] Test real-time data updates
- [ ] Add error handling and empty states

---

## Testing the Implementation

### Test 1: Check Firestore Connection
```kotlin
// In ViewModel or Fragment
val db = FirebaseFirestore.getInstance()
db.collection("communityUpdates").get().addOnSuccessListener { snapshot ->
    val count = snapshot.size()
    Log.d("Firestore", "Found $count community updates")
}
```

### Test 2: Add Test Event
In Firebase Console:
1. Go to Firestore
2. Create document in `communityUpdates` collection
3. Add test data:
   ```
   eventName: "Test Event"
   date: "2025-02-10"
   time: "10:00 AM"
   description: "Test description"
   createdAt: (current timestamp)
   ```

### Test 3: Verify Real-time Update
1. Open Android app
2. Check if green card shows the event
3. In Firebase Console, change event name
4. Watch app UI update automatically (no refresh needed!)

---

## No Notifications Required

This implementation uses:
✅ Firestore real-time listeners
✅ Kotlin Flows for reactive updates
✅ Direct UI binding to data

This means:
❌ No Cloud Functions needed
❌ No Firebase Cloud Messaging needed
❌ No device token management
❌ No notification permissions needed

Just **real-time data from Firestore to Android UI**!

package com.se.aguapronta.fragments

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import android.widget.Toast
import androidx.databinding.DataBindingUtil
import androidx.fragment.app.FragmentActivity
import com.google.firebase.auth.FirebaseAuth
import com.se.aguapronta.MainActivity
import com.se.aguapronta.R
import com.se.aguapronta.SecondActivity
import com.se.aguapronta.databinding.FragmentStateBinding
import com.se.aguapronta.databinding.SecondActivityBinding



class StateFragment : Fragment() {

    //private var _binding: FragmentStateBinding? = null
    //private val binding get() = _binding!!
    //private lateinit var firebaseAuth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        /*firebaseAuth = FirebaseAuth.getInstance()

       binding.btnlogout.setOnClickListener {
            firebaseAuth.signOut()
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)

        }*/


    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        //binding = DataBindingUtil.inflate(inflater, R.layout.fragment_state, container, false)
        //var rootView = binding.root
        //return rootView
        return inflater.inflate(R.layout.fragment_state, container, false)
        //_binding = FragmentStateBinding.inflate(inflater, container, false)
        //val view = binding.root
        //return view
    }

}
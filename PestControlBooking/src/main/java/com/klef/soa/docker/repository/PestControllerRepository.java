package com.klef.soa.docker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.docker.entity.PestControllerEntity;

public interface PestControllerRepository extends JpaRepository<PestControllerEntity, Long> {

}

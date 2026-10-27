
package com.klef.soa.docker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klef.soa.docker.entity.PestControllerEntity;
import com.klef.soa.docker.repository.PestControllerRepository;

@Service
public class PestControllerServiceImpl implements PestControllerService {

    @Autowired
    private PestControllerRepository pestControllerRepository;

    @Override
    public PestControllerEntity addPest(PestControllerEntity p) {
        return pestControllerRepository.save(p);
    }

    @Override
    public List<PestControllerEntity> displayAll() {
        return pestControllerRepository.findAll();
    }

    @Override
    public PestControllerEntity displayById(Long id) {
        return pestControllerRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Booking not found with ID: " + id));
    }

    @Override
    public PestControllerEntity updatePest(Long id, PestControllerEntity p) {
        PestControllerEntity existing =
                pestControllerRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Booking not found with ID: " + id));

        p.setId(existing.getId());

        return pestControllerRepository.save(p);
    }

    @Override
    public String deletePest(Long id) {
        if (!pestControllerRepository.existsById(id)) {
            return "Booking not found with ID: " + id;
        }

        pestControllerRepository.deleteById(id);
        return "Booking deleted successfully";
    }
}
